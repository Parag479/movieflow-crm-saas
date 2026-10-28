import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/auth";
import { round2 } from "@/lib/ledger";

export async function GET(request: Request) {
  try {
    const authResult = await requireTenantAuth(request);
    if ("response" in authResult) return authResult.response;
    const { context } = authResult;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "outstanding"; // outstanding, state-pending, screen-collections, daily-audience, overdue-reminders, monthly-pnl
    const format = searchParams.get("format"); // "csv" or json
    const distributorId = searchParams.get("distributorId");
    const movieId = searchParams.get("movieId");
    const state = searchParams.get("state");

    const now = new Date();

    // ─── 1. Distributor-wise Outstanding Report ─────────────────────────────
    if (type === "outstanding") {
      const distributors = await prisma.distributor.findMany({
        where: {
          companyId: context.companyId,
          ...(distributorId ? { id: distributorId } : {}),
        },
        include: {
          invoices: true,
          payments: { where: { status: "COMPLETED" } },
          ledgerEntries: { orderBy: { entryDate: "desc" }, take: 1 },
        },
      });

      const rows = distributors.map((d) => {
        const billed = round2(d.invoices.reduce((acc, i) => acc + i.totalAmount, 0));
        const received = round2(d.payments.reduce((acc, p) => acc + p.amount, 0));
        const balance = d.ledgerEntries[0] ? d.ledgerEntries[0].runningBalance : round2(billed - received);

        let overdue = 0;
        let upcoming = 0;
        d.invoices.forEach((inv) => {
          const invBal = inv.balanceAmount > 0 ? inv.balanceAmount : inv.totalAmount - (inv.paidAmount || 0);
          if (invBal > 0) {
            if (new Date(inv.dueDate) < now) {
              overdue += invBal;
            } else {
              upcoming += invBal;
            }
          }
        });

        return {
          distributorName: d.name,
          distributorCode: d.code,
          territory: d.territory || "Pan India",
          contactPerson: d.contactPerson || "Manager",
          phone: d.phone || "N/A",
          totalInvoiced: billed,
          totalReceived: received,
          outstandingBalance: balance,
          overdueAmount: round2(overdue),
          upcomingDue: round2(upcoming),
          status: balance > 0 ? (overdue > 0 ? "OVERDUE_ALERT" : "PENDING_SETTLEMENT") : "SETTLED",
        };
      });

      if (format === "csv") {
        const headers = ["Distributor Name,Code,Territory,Contact Person,Total Invoiced,Total Received,Outstanding Balance,Overdue Amount,Upcoming Due,Status\n"];
        const csvRows = rows.map((r) =>
          `"${r.distributorName}","${r.distributorCode}","${r.territory}","${r.contactPerson}",${r.totalInvoiced},${r.totalReceived},${r.outstandingBalance},${r.overdueAmount},${r.upcomingDue},"${r.status}"`
        );
        return new Response(headers.concat(csvRows).join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="distributor_outstanding_report.csv"',
          },
        });
      }

      return NextResponse.json({ success: true, type, data: rows });
    }

    // ─── 2. State-Wise Pending Payment Report ───────────────────────────────
    if (type === "state-pending") {
      const collections = await prisma.collection.findMany({
        where: { companyId: context.companyId, ...(state ? { state } : {}) },
      });
      const invoices = await prisma.invoice.findMany({ where: { companyId: context.companyId } });
      const payments = await prisma.payment.findMany({ where: { companyId: context.companyId, status: "COMPLETED" } });

      const stateMap: Record<string, any> = {};
      collections.forEach((c) => {
        const st = c.state || "Maharashtra";
        if (!stateMap[st]) {
          stateMap[st] = { state: st, gross: 0, net: 0, distShare: 0, admissions: 0 };
        }
        stateMap[st].gross += c.grossAmount;
        stateMap[st].net += c.netAmount;
        stateMap[st].distShare += c.distributorAmt;
        stateMap[st].admissions += c.admissions;
      });

      const totalGross = Object.values(stateMap).reduce((acc, s) => acc + s.gross, 0) || 1;
      const totalInvOverdue = invoices.reduce((acc, inv) => {
        const bal = inv.balanceAmount > 0 ? inv.balanceAmount : inv.totalAmount - (inv.paidAmount || 0);
        return new Date(inv.dueDate) < now ? acc + bal : acc;
      }, 0);
      const totalInvPending = invoices.reduce((acc, inv) => {
        const bal = inv.balanceAmount > 0 ? inv.balanceAmount : inv.totalAmount - (inv.paidAmount || 0);
        return new Date(inv.dueDate) >= now ? acc + bal : acc;
      }, 0);
      const totalReceived = payments.reduce((acc, p) => acc + p.amount, 0);

      const rows = Object.values(stateMap).map((s: any) => {
        const ratio = s.gross / totalGross;
        return {
          state: s.state,
          grossCollection: round2(s.gross),
          distributorShare: round2(s.distShare),
          estimatedReceived: round2(totalReceived * ratio),
          pendingAmount: round2(totalInvPending * ratio),
          overdueAmount: round2(totalInvOverdue * ratio),
          totalAudience: s.admissions,
        };
      });

      if (format === "csv") {
        const headers = ["State,Gross Collection,Distributor Share,Payments Received,Pending Amount,Overdue Amount,Total Audience\n"];
        const csvRows = rows.map((r) =>
          `"${r.state}",${r.grossCollection},${r.distributorShare},${r.estimatedReceived},${r.pendingAmount},${r.overdueAmount},${r.totalAudience}`
        );
        return new Response(headers.concat(csvRows).join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="state_pending_payments_report.csv"',
          },
        });
      }

      return NextResponse.json({ success: true, type, data: rows });
    }

    // ─── 3. Movie-Wise and Screen-Wise Collection Report ────────────────────
    if (type === "screen-collections") {
      const collections = await prisma.collection.findMany({
        where: {
          companyId: context.companyId,
          ...(movieId ? { movieId } : {}),
          ...(distributorId ? { distributorId } : {}),
          ...(state ? { state } : {}),
        },
        include: {
          movie: true,
          distributor: true,
          theater: true,
          screen: true,
        },
        orderBy: { collectionDate: "desc" },
      });

      const rows = collections.map((c) => ({
        movieTitle: c.movie.title,
        distributor: c.distributor?.name || "AA Films",
        theaterName: c.theater?.name || "Multiplex",
        screenName: c.screen?.name || `Screen ${c.screen?.screenNumber || 1}`,
        format: c.screen?.screenFormat || "2D",
        state: c.state || "Maharashtra",
        city: c.city || "Mumbai",
        date: c.collectionDate.toISOString().split("T")[0],
        shows: c.shows,
        occupancy: `${c.occupancyRate}%`,
        ticketsSold: c.admissions,
        gross: round2(c.grossAmount),
        gst: round2(c.gstAmount),
        net: round2(c.netAmount),
        distributorShare: round2(c.distributorAmt),
        exhibitorShare: round2(c.exhibitorAmt),
      }));

      if (format === "csv") {
        const headers = ["Movie,Distributor,Theatre,Screen,Format,State,City,Date,Shows,Occupancy,Tickets Sold,Gross,GST,Net,Distributor Share,Exhibitor Share\n"];
        const csvRows = rows.map((r) =>
          `"${r.movieTitle}","${r.distributor}","${r.theaterName}","${r.screenName}","${r.format}","${r.state}","${r.city}","${r.date}",${r.shows},"${r.occupancy}",${r.ticketsSold},${r.gross},${r.gst},${r.net},${r.distributorShare},${r.exhibitorShare}`
        );
        return new Response(headers.concat(csvRows).join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="screen_collections_report.csv"',
          },
        });
      }

      return NextResponse.json({ success: true, type, data: rows });
    }

    // ─── 4. Overdue Invoices and Payment Reminders ───────────────────────────
    if (type === "overdue-reminders") {
      const invoices = await prisma.invoice.findMany({
        where: {
          companyId: context.companyId,
          ...(distributorId ? { distributorId } : {}),
          status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] },
        },
        include: {
          distributor: true,
          deal: { include: { movie: true } },
          payments: true,
        },
        orderBy: { dueDate: "asc" },
      });

      const rows = invoices.map((inv) => {
        const balance = inv.balanceAmount > 0 ? inv.balanceAmount : inv.totalAmount - (inv.paidAmount || 0);
        const isOverdue = new Date(inv.dueDate) < now;
        const daysOverdue = isOverdue
          ? Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000)
          : 0;

        return {
          invoiceNumber: inv.invoiceNumber,
          distributorName: inv.distributor?.name || "Independent",
          distributorEmail: inv.distributor?.email || "finance@distributor.com",
          movieTitle: inv.deal?.movie?.title || "Box Office Distribution",
          totalAmount: round2(inv.totalAmount),
          paidAmount: round2(inv.paidAmount),
          balanceAmount: round2(balance),
          dueDate: inv.dueDate.toISOString().split("T")[0],
          isOverdue,
          daysOverdue,
          status: isOverdue ? "OVERDUE" : inv.status,
          reminderMessage: isOverdue
            ? `Payment of ₹${balance.toLocaleString("en-IN")} is ${daysOverdue} days overdue (Due Date: ${inv.dueDate.toISOString().split("T")[0]})`
            : `Upcoming payment of ₹${balance.toLocaleString("en-IN")} due on ${inv.dueDate.toISOString().split("T")[0]}`,
        };
      });

      return NextResponse.json({ success: true, type, data: rows });
    }

    // Fallback: Monthly P&L and Reconciliation Summary
    const collections = await prisma.collection.findMany({ where: { companyId: context.companyId } });
    const invoices = await prisma.invoice.findMany({ where: { companyId: context.companyId } });
    const payments = await prisma.payment.findMany({ where: { companyId: context.companyId, status: "COMPLETED" } });
    const expenses = await prisma.expense.findMany({ where: { companyId: context.companyId } });

    const totalGross = round2(collections.reduce((a, c) => a + c.grossAmount, 0));
    const totalGst = round2(collections.reduce((a, c) => a + c.gstAmount, 0));
    const totalNet = round2(collections.reduce((a, c) => a + c.netAmount, 0));
    const totalDistShare = round2(collections.reduce((a, c) => a + c.distributorAmt, 0));
    const totalExhShare = round2(collections.reduce((a, c) => a + c.exhibitorAmt, 0));
    const totalInvoiced = round2(invoices.reduce((a, i) => a + i.totalAmount, 0));
    const totalReceived = round2(payments.reduce((a, p) => a + p.amount, 0));
    const totalExpenses = round2(expenses.reduce((a, e) => a + e.amount, 0));
    const netProfit = round2(totalDistShare - totalExpenses);

    return NextResponse.json({
      success: true,
      type: "monthly-pnl",
      data: {
        summary: {
          totalGross,
          totalGst,
          totalNet,
          totalDistShare,
          totalExhShare,
          totalInvoiced,
          totalReceived,
          totalExpenses,
          netProfit,
          reconciliationDiff: round2(totalDistShare - totalInvoiced),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
