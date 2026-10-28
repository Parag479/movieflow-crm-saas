import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "collections";

    if (type === "collections") {
      const collections = await prisma.collection.findMany({
        include: { movie: true, territory: true, theater: true },
        take: 200,
      });

      let csv = "Movie,Territory,Theater,Week,Day,Gross Collection (INR),Net Collection (INR),Distributor Share (INR),Exhibitor Share (INR),Occupancy (%)\n";
      collections.forEach((c) => {
        csv += `"${c.movie.title}","${c.territory?.name || "N/A"}","${c.theater?.name || "N/A"}",${c.week},"${c.dayOfWeek}",${c.grossAmount},${c.netAmount},${c.distributorAmt},${c.exhibitorAmt},${c.occupancyRate}\n`;
      });

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="box_office_collections.csv"',
        },
      });
    } else if (type === "distributions") {
      const distributions = await prisma.distribution.findMany({
        include: { movie: true, territory: true, distributor: true },
      });

      let csv = "Movie,Territory,Distributor,Release Date,Total Screens,Total Theatres,Distribution Cost (INR),Gross Collection (INR),Distributor Share (INR),Net Profit (INR)\n";
      distributions.forEach((d) => {
        const profit = d.distributorShare - d.distributionCost;
        csv += `"${d.movie.title}","${d.territory.name}","${d.distributor?.name || "Self"}",${d.releaseDate.toISOString().split("T")[0]},${d.totalScreens},${d.totalTheatres},${d.distributionCost},${d.grossCollection},${d.distributorShare},${profit}\n`;
      });

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="distribution_performance.csv"',
        },
      });
    }

    return NextResponse.json({ success: false, message: "Invalid report type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
