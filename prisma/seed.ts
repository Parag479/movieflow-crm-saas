import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎬 Seeding MovieFlow Complete Distributor & Box Office CRM...");

  // Clean existing tables in proper order
  await prisma.distributorLedger.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.cityRelease.deleteMany();
  await prisma.distribution.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.agreement.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.show.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.theater.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.distributor.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();

  // ─── 1. Roles ─────────────────────────────────────────────────────────────
  const roleNames = [
    { name: "SUPER_ADMIN", description: "Full system administration access" },
    { name: "COMPANY_ADMIN", description: "Company level administrative control" },
    { name: "FINANCE_MANAGER", description: "Collections, expenses, invoices, settlements, and payment approvals" },
    { name: "STATE_MANAGER", description: "Manages assigned state and territory data" },
    { name: "TERRITORY_MANAGER", description: "Manages assigned territory circuits" },
    { name: "DISTRIBUTOR", description: "Distributor account - restricted to own movies, screens, ledgers, invoices" },
    { name: "DATA_ENTRY", description: "Permitted data entry operator without financial approval rights" },
    { name: "THEATER_OWNER", description: "Theater venue operator" },
    { name: "SALES_AGENT", description: "Sales and lead management" },
  ];
  const roleMap: Record<string, string> = {};
  for (const r of roleNames) {
    const rec = await prisma.role.upsert({ where: { name: r.name }, update: { description: r.description }, create: r });
    roleMap[r.name] = rec.id;
  }

  // ─── 2. Company (Tenant) ──────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { code: "METRO_CINEMA" },
    update: {},
    create: {
      name: "Metro Cinema Group",
      code: "METRO_CINEMA",
      logoUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=60",
      brandColor: "#0c8de9",
      email: "corporate@metrocinemas.com",
      phone: "+91 98765 43210",
      address: "101 Cinema Boulevard, Bandra West",
      city: "Mumbai",
      country: "India",
      gstNumber: "27AAACM1234F1Z9",
      status: "ACTIVE",
    },
  });

  // ─── 3. Territories ───────────────────────────────────────────────────────
  const territoriesData = [
    { name: "Mumbai Circuit",       code: "MUM", region: "West",     cities: JSON.stringify(["Mumbai", "Thane", "Navi Mumbai", "Kalyan"]), svgX: 185, svgY: 375, latitude: 19.076, longitude: 72.877 },
    { name: "Maharashtra",          code: "MH",  region: "West",     cities: JSON.stringify(["Pune", "Nagpur", "Nashik", "Aurangabad"]),  svgX: 200, svgY: 360, latitude: 19.7, longitude: 75.7 },
    { name: "North India",          code: "NI",  region: "North",    cities: JSON.stringify(["Delhi", "Lucknow", "Chandigarh", "Jaipur"]),svgX: 235, svgY: 210, latitude: 28.6, longitude: 77.2 },
    { name: "South India",          code: "SI",  region: "South",    cities: JSON.stringify(["Chennai", "Bengaluru", "Hyderabad", "Kochi"]),svgX: 230, svgY: 460, latitude: 13.08, longitude: 80.27 },
    { name: "East India",           code: "EI",  region: "East",     cities: JSON.stringify(["Kolkata", "Bhubaneswar", "Guwahati"]),     svgX: 320, svgY: 280, latitude: 22.57, longitude: 88.36 },
    { name: "Gujarat & Rajasthan",  code: "GR",  region: "West",     cities: JSON.stringify(["Ahmedabad", "Surat", "Jaipur", "Jodhpur"]),svgX: 165, svgY: 280, latitude: 23.02, longitude: 72.57 },
    { name: "Central India",        code: "CI",  region: "Central",  cities: JSON.stringify(["Bhopal", "Indore", "Raipur"]),              svgX: 240, svgY: 310, latitude: 23.25, longitude: 77.4 },
    { name: "Overseas",             code: "OV",  region: "Overseas", cities: JSON.stringify(["USA", "UK", "UAE", "Australia", "Canada"]),svgX: 80,  svgY: 80,  latitude: 0, longitude: 0 },
  ];

  const territories: Record<string, string> = {};
  for (const t of territoriesData) {
    const rec = await prisma.territory.upsert({ where: { code: t.code }, update: {}, create: t });
    territories[t.code] = rec.id;
  }

  // ─── 4. Distributors with Assigned States ──────────────────────────────────
  const distData = [
    {
      name: "AA Films India Pvt Ltd",
      code: "AA_FILMS",
      territory: "Pan India",
      states: JSON.stringify(["Maharashtra", "Goa", "Gujarat", "Delhi", "Uttar Pradesh"]),
      type: "MAIN",
      email: "accounts@aafilms.in",
      phone: "+91 98200 11223",
      contactPerson: "Anil Thadani",
      bankName: "HDFC Bank",
      accountNumber: "50200889912345",
      ifscCode: "HDFC0000123",
      gstNumber: "27AAACA1234F1Z5",
      panNumber: "AAACA1234F",
    },
    {
      name: "Warner Bros Studios India",
      code: "WB_IND",
      territory: "North India",
      states: JSON.stringify(["Delhi", "Punjab", "Haryana", "Uttar Pradesh", "Rajasthan"]),
      type: "MAIN",
      email: "finance@warnerbros.co.in",
      phone: "+91 98100 44556",
      contactPerson: "Denzil Dias",
      bankName: "Citibank N.A.",
      accountNumber: "001298457812",
      ifscCode: "CITI0000002",
      gstNumber: "07AAACW5678B1Z1",
      panNumber: "AAACW5678B",
    },
    {
      name: "Disney Studios India",
      code: "DSI",
      territory: "Pan India",
      states: JSON.stringify(["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "West Bengal"]),
      type: "MAIN",
      email: "theatrical@disney.co.in",
      phone: "+91 98210 99887",
      contactPerson: "Bikram Duggal",
      bankName: "Standard Chartered Bank",
      accountNumber: "220199482711",
      ifscCode: "SCBL0036001",
      gstNumber: "27AAACD9988P1Z8",
      panNumber: "AAACD9988P",
    },
    {
      name: "Viacom18 Motion Pictures",
      code: "V18",
      territory: "Pan India",
      states: JSON.stringify(["Maharashtra", "Gujarat", "Central India", "Delhi"]),
      type: "MAIN",
      email: "distribution@viacom18.com",
      phone: "+91 98333 55667",
      contactPerson: "Ajit Andhare",
      bankName: "ICICI Bank",
      accountNumber: "000405001234",
      ifscCode: "ICIC0000004",
      gstNumber: "27AAACV7766M1ZX",
      panNumber: "AAACV7766M",
    },
    {
      name: "Excel Entertainment",
      code: "EXCEL",
      territory: "Mumbai Circuit",
      states: JSON.stringify(["Maharashtra", "Goa"]),
      type: "SUB",
      email: "finance@excelmovies.com",
      phone: "+91 98201 33445",
      contactPerson: "Ritesh Sidhwani",
      bankName: "Kotak Mahindra Bank",
      accountNumber: "661200984511",
      ifscCode: "KKBK0000958",
      gstNumber: "27AAACE4433E1Z2",
      panNumber: "AAACE4433E",
    },
    {
      name: "UFO Moviez India",
      code: "UFO",
      territory: "South India",
      states: JSON.stringify(["Karnataka", "Tamil Nadu", "Telangana", "Kerala", "Andhra Pradesh"]),
      type: "SUB",
      email: "operations@ufomoviez.com",
      phone: "+91 98450 77889",
      contactPerson: "Rajesh Mishra",
      bankName: "Axis Bank",
      accountNumber: "918020034567",
      ifscCode: "UTIB0000040",
      gstNumber: "29AAACU3322L1Z9",
      panNumber: "AAACU3322L",
    },
  ];

  const distributors: Record<string, string> = {};
  for (const d of distData) {
    const dist = await prisma.distributor.create({
      data: {
        companyId: company.id,
        name: d.name,
        code: d.code,
        territory: d.territory,
        states: d.states,
        type: d.type,
        email: d.email,
        phone: d.phone,
        contactPerson: d.contactPerson,
        bankName: d.bankName,
        accountNumber: d.accountNumber,
        ifscCode: d.ifscCode,
        gstNumber: d.gstNumber,
        panNumber: d.panNumber,
        status: "ACTIVE",
      },
    });
    distributors[d.code] = dist.id;
  }

  // ─── 5. Role-Based Users ──────────────────────────────────────────────────
  const usersToSeed = [
    {
      email: "admin@movieflow.com",
      fullName: "Rajesh Singhania",
      role: "SUPER_ADMIN",
      designation: "Chief Executive Officer",
      phone: "+91 99999 88888",
    },
    {
      email: "finance@metrocinemas.com",
      fullName: "Neha Sharma",
      role: "FINANCE_MANAGER",
      designation: "Head of Theatrical Finance",
      phone: "+91 98111 55667",
    },
    {
      email: "statemanager.mh@metrocinemas.com",
      fullName: "Sanjay Deshmukh",
      role: "STATE_MANAGER",
      designation: "Maharashtra State Distribution Head",
      assignedState: "Maharashtra",
      phone: "+91 98220 77889",
    },
    {
      email: "distributor@aafilms.in",
      fullName: "Anil Thadani",
      role: "DISTRIBUTOR",
      designation: "Managing Director (AA Films)",
      distributorId: distributors["AA_FILMS"],
      phone: "+91 98200 11223",
    },
    {
      email: "dataentry@metrocinemas.com",
      fullName: "Pooja Varma",
      role: "DATA_ENTRY",
      designation: "Box Office Data Entry Operator",
      phone: "+91 98330 22334",
    },
  ];

  for (const u of usersToSeed) {
    await prisma.user.create({
      data: {
        companyId: company.id,
        email: u.email,
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
        fullName: u.fullName,
        designation: u.designation,
        phone: u.phone,
        assignedState: u.assignedState || null,
        distributorId: u.distributorId || null,
        status: "ACTIVE",
        roles: {
          create: {
            roleId: roleMap[u.role] || roleMap["COMPANY_ADMIN"],
          },
        },
      },
    });
  }

  // ─── 6. Theaters & Screens Across India ───────────────────────────────────
  const theatersData = [
    { name: "PVR IMAX Juhu",          city: "Mumbai",     state: "Maharashtra", circuit: "PVR INOX", screens: 5, cap: 1200 },
    { name: "INOX Nariman Point",      city: "Mumbai",     state: "Maharashtra", circuit: "PVR INOX", screens: 4, cap: 900 },
    { name: "Cinepolis Thane",         city: "Thane",      state: "Maharashtra", circuit: "Cinepolis", screens: 6, cap: 1400 },
    { name: "PVR Ambience Gurgaon",    city: "Gurgaon",    state: "Haryana",     circuit: "PVR INOX", screens: 9, cap: 2100 },
    { name: "INOX Nehru Place Delhi",  city: "Delhi",      state: "Delhi",       circuit: "PVR INOX", screens: 5, cap: 1100 },
    { name: "Wave Cinemas Lucknow",    city: "Lucknow",    state: "Uttar Pradesh", circuit: "Wave", screens: 4, cap: 950 },
    { name: "Cinepolis Jaipur",        city: "Jaipur",     state: "Rajasthan",   circuit: "Cinepolis", screens: 5, cap: 1100 },
    { name: "SPI Sathyam Chennai",     city: "Chennai",    state: "Tamil Nadu",  circuit: "SPI Cinemas", screens: 6, cap: 1500 },
    { name: "PVR Forum Bengaluru",     city: "Bengaluru",  state: "Karnataka",   circuit: "PVR INOX", screens: 7, cap: 1600 },
    { name: "AMB Cinemas Hyderabad",   city: "Hyderabad",  state: "Telangana",   circuit: "AMB", screens: 6, cap: 1400 },
    { name: "INOX Kolkata",            city: "Kolkata",    state: "West Bengal", circuit: "PVR INOX", screens: 4, cap: 950 },
    { name: "Cinepolis Ahmedabad",     city: "Ahmedabad",  state: "Gujarat",     circuit: "Cinepolis", screens: 5, cap: 1200 },
    { name: "Gold Cinema Kochi",       city: "Kochi",      state: "Kerala",      circuit: "Gold", screens: 4, cap: 900 },
  ];

  const theaterRecords: any[] = [];
  const screenRecords: any[] = [];

  for (const t of theatersData) {
    const theater = await prisma.theater.create({
      data: {
        companyId: company.id,
        name: t.name,
        address: `${t.city} Central Hub`,
        city: t.city,
        state: t.state,
        circuit: t.circuit,
        totalScreens: t.screens,
        totalCapacity: t.cap,
        ownerName: `${t.circuit} Management`,
        ownerPhone: "+91 98000 11222",
        ownerEmail: `ops@${t.name.toLowerCase().replace(/\s/g, "")}.com`,
        screens: {
          create: Array.from({ length: t.screens }, (_, i) => ({
            name: `Screen ${i + 1}${i === 0 ? " (IMAX Laser)" : i === 1 ? " (4DX)" : ""}`,
            screenNumber: i + 1,
            seatingCapacity: Math.floor(t.cap / t.screens),
            screenFormat: i === 0 ? "IMAX" : i === 1 ? "4DX" : "2D",
            soundSystem: i <= 1 ? "Dolby Atmos" : "Dolby 7.1",
            status: "OPERATIONAL",
          })),
        },
      },
      include: { screens: true },
    });
    theaterRecords.push(theater);
    screenRecords.push(...theater.screens);
  }

  // ─── 7. Movies ────────────────────────────────────────────────────────────
  const moviesData = [
    {
      title: "Stree 3",
      language: "Hindi", genre: "Horror / Comedy", durationMinutes: 145,
      rating: "U/A", director: "Amar Kaushik", producer: "Dinesh Vijan",
      productionHouse: "Maddock Films", distributorName: "AA Films",
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
      releaseDate: new Date("2026-08-15"), budgetAmount: 800000000, printsCost: 120000000,
      pubCost: 200000000, totalDistCost: 320000000, weeklyGross: 480000000,
      lifetimeGross: 1900000000, totalScreens: 7800, totalTheatres: 3200, status: "IN_THEATERS",
    },
    {
      title: "Pushpa 3: The Rampage",
      language: "Telugu / Hindi", genre: "Action / Drama", durationMinutes: 190,
      rating: "A", director: "Sukumar", producer: "Mythri Movie Makers",
      productionHouse: "Mythri Movies", distributorName: "AA Films / UFO",
      posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      releaseDate: new Date("2026-12-05"), budgetAmount: 4000000000, printsCost: 600000000,
      pubCost: 800000000, totalDistCost: 1400000000, weeklyGross: 0,
      lifetimeGross: 0, totalScreens: 0, totalTheatres: 0, status: "UPCOMING",
    },
    {
      title: "Avatar: Fire & Ash",
      language: "English / Hindi", genre: "Sci-Fi / Action", durationMinutes: 192,
      rating: "U/A", director: "James Cameron", producer: "20th Century Studios",
      productionHouse: "Lightstorm Entertainment", distributorName: "Disney Studios India",
      posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
      releaseDate: new Date("2026-12-18"), budgetAmount: 25000000000, printsCost: 400000000,
      pubCost: 600000000, totalDistCost: 1000000000, weeklyGross: 0,
      lifetimeGross: 0, totalScreens: 0, totalTheatres: 0, status: "UPCOMING",
    },
    {
      title: "Singham Returns 2",
      language: "Hindi", genre: "Action", durationMinutes: 155,
      rating: "U/A", director: "Rohit Shetty", producer: "Reliance Entertainment",
      productionHouse: "Rohit Shetty Picturez", distributorName: "Viacom18 Motion Pictures",
      posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80",
      releaseDate: new Date("2026-10-02"), budgetAmount: 3000000000, printsCost: 450000000,
      pubCost: 550000000, totalDistCost: 1000000000, weeklyGross: 620000000,
      lifetimeGross: 4500000000, totalScreens: 6500, totalTheatres: 2800, status: "IN_THEATERS",
    },
  ];

  const movieRecords: any[] = [];
  for (const m of moviesData) {
    const movie = await prisma.movie.create({ data: { ...m, companyId: company.id } });
    movieRecords.push(movie);
  }

  // ─── 8. Distributions (Movie to Territory & Distributor) ───────────────────
  const streeDistributions = [
    { tCode: "MUM", screens: 1800, theatres: 450, cost: 80000000, gross: 620000000, distPct: 50, occ: 91, distCode: "AA_FILMS" },
    { tCode: "MH",  screens: 900,  theatres: 280, cost: 40000000, gross: 280000000, distPct: 50, occ: 85, distCode: "AA_FILMS" },
    { tCode: "NI",  screens: 2200, theatres: 650, cost: 90000000, gross: 520000000, distPct: 55, occ: 88, distCode: "WB_IND" },
    { tCode: "SI",  screens: 1500, theatres: 480, cost: 65000000, gross: 380000000, distPct: 50, occ: 82, distCode: "UFO" },
    { tCode: "GR",  screens: 500,  theatres: 180, cost: 18000000, gross: 60000000,  distPct: 50, occ: 78, distCode: "EXCEL" },
  ];

  const distRecords: any[] = [];
  for (const d of streeDistributions) {
    const net = d.gross * 0.82;
    const dist = await prisma.distribution.create({
      data: {
        companyId: company.id,
        movieId: movieRecords[0].id,
        distributorId: distributors[d.distCode],
        territoryId: territories[d.tCode],
        releaseDate: new Date("2026-08-15"),
        weekOfRelease: 3,
        totalScreens: d.screens,
        totalTheatres: d.theatres,
        distributionCost: d.cost,
        printsCost: d.cost * 0.4,
        pubCost: d.cost * 0.6,
        grossCollection: d.gross,
        netCollection: net,
        distributorShare: net * (d.distPct / 100),
        exhibitorShare: net * ((100 - d.distPct) / 100),
        distributorSharePct: d.distPct,
        exhibitorSharePct: 100 - d.distPct,
        occupancyRate: d.occ,
        status: "ACTIVE",
      },
    });
    distRecords.push(dist);
  }

  // ─── 9. Shows Attached to Screens ─────────────────────────────────────────
  const showRecords: any[] = [];
  for (let i = 0; i < Math.min(screenRecords.length, 25); i++) {
    const screen = screenRecords[i];
    const show = await prisma.show.create({
      data: {
        companyId: company.id,
        movieId: movieRecords[0].id,
        screenId: screen.id,
        showDate: new Date("2026-10-10"),
        startTime: "18:00",
        endTime: "20:30",
        ticketPriceStandard: 350,
        ticketPriceVip: 650,
        seatsBooked: Math.floor(screen.seatingCapacity * 0.85),
        status: "SCHEDULED",
      },
    });
    showRecords.push(show);
  }

  // ─── 10. Comprehensive Screen-Wise Collections (Prevent Duplicates) ───────
  console.log("📊 Seeding screen-level collections...");
  for (let i = 0; i < showRecords.length; i++) {
    const show = showRecords[i];
    const screen = screenRecords.find((s) => s.id === show.screenId);
    const theater = theaterRecords.find((t) => t.id === screen?.theaterId);
    if (!theater || !screen) continue;

    // Determine distributor by state/territory
    let distId = distributors["AA_FILMS"];
    if (theater.state === "Delhi" || theater.state === "Uttar Pradesh" || theater.state === "Haryana") {
      distId = distributors["WB_IND"];
    } else if (theater.state === "Karnataka" || theater.state === "Tamil Nadu" || theater.state === "Telangana" || theater.state === "Kerala") {
      distId = distributors["UFO"];
    }

    const admissions = Math.round(screen.seatingCapacity * (0.75 + (i % 3) * 0.08) * 4); // 4 shows a day
    const gross = admissions * 320;
    const gstRate = 18;
    const gstAmount = Math.round((gross * gstRate) / (100 + gstRate));
    const deductions = Math.round(gross * 0.02); // 2% local municipal cess/online charges
    const net = gross - gstAmount - deductions;
    const distSharePct = 52.5; // contractual distributor share
    const distAmt = Math.round(net * (distSharePct / 100));
    const exhAmt = net - distAmt;
    const occ = Math.min(98, Math.round(72 + (i % 5) * 5.5));

    await prisma.collection.create({
      data: {
        companyId: company.id,
        movieId: movieRecords[0].id,
        distributorId: distId,
        screenId: screen.id,
        showId: show.id,
        theaterId: theater.id,
        state: theater.state,
        city: theater.city,
        collectionDate: new Date("2026-10-10"),
        week: 1,
        dayOfWeek: "Saturday",
        grossAmount: gross,
        gstRate,
        gstAmount,
        deductions,
        netAmount: net,
        distributorSharePct: distSharePct,
        exhibitorSharePct: 100 - distSharePct,
        distributorAmt: distAmt,
        exhibitorAmt: exhAmt,
        admissions,
        occupancyRate: occ,
        shows: 4,
        status: "VERIFIED",
        notes: `Screen ${screen.screenNumber} Saturday primary weekend show collection`,
      },
    });
  }

  // ─── 11. Deals, Invoices & Verified Payments ──────────────────────────────
  console.log("💰 Seeding distributor deals, invoices & ledger balances...");

  // Deal 1: AA Films Deal
  const aaDeal = await prisma.deal.create({
    data: {
      dealNumber: "DEAL-2026-AA-01",
      companyId: company.id,
      movieId: movieRecords[0].id,
      theaterId: theaterRecords[0].id,
      distributorId: distributors["AA_FILMS"],
      agreementType: "REVENUE_SHARE",
      mgAmount: 5000000,
      revenueSharePercent: 52.5,
      distributorSharePct: 52.5,
      exhibitorSharePct: 47.5,
      distributorCommission: 10,
      territory: "Mumbai Circuit",
      startDate: new Date("2026-08-15"),
      endDate: new Date("2026-11-30"),
      status: "EXECUTED",
    },
  });

  // Deal 2: Warner Bros Deal
  const wbDeal = await prisma.deal.create({
    data: {
      dealNumber: "DEAL-2026-WB-02",
      companyId: company.id,
      movieId: movieRecords[0].id,
      theaterId: theaterRecords[4].id, // Delhi INOX
      distributorId: distributors["WB_IND"],
      agreementType: "MINIMUM_GUARANTEE",
      mgAmount: 15000000,
      revenueSharePercent: 55,
      distributorSharePct: 55,
      exhibitorSharePct: 45,
      distributorCommission: 8,
      territory: "North India",
      startDate: new Date("2026-08-15"),
      endDate: new Date("2026-11-30"),
      status: "EXECUTED",
    },
  });

  // Deal 3: UFO Deal
  const ufoDeal = await prisma.deal.create({
    data: {
      dealNumber: "DEAL-2026-UFO-03",
      companyId: company.id,
      movieId: movieRecords[0].id,
      theaterId: theaterRecords[8].id, // Bengaluru
      distributorId: distributors["UFO"],
      agreementType: "REVENUE_SHARE",
      mgAmount: 8000000,
      revenueSharePercent: 50,
      distributorSharePct: 50,
      exhibitorSharePct: 50,
      distributorCommission: 10,
      territory: "South India",
      startDate: new Date("2026-08-15"),
      endDate: new Date("2026-11-30"),
      status: "EXECUTED",
    },
  });

  // Invoices & Payments for AA Films
  // Invoice 1 (Paid)
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-AA-101",
      companyId: company.id,
      dealId: aaDeal.id,
      distributorId: distributors["AA_FILMS"],
      amountBeforeTax: 10000000,
      cgstAmount: 900000,
      sgstAmount: 900000,
      igstAmount: 0,
      totalAmount: 11800000,
      paidAmount: 11800000,
      balanceAmount: 0,
      dueDate: new Date("2026-09-01"),
      paidAt: new Date("2026-08-28"),
      status: "PAID",
      notes: "Week 1 Advance Minimum Guarantee Settlement",
    },
  });

  const pay1 = await prisma.payment.create({
    data: {
      paymentNumber: "PAY-2026-001",
      companyId: company.id,
      dealId: aaDeal.id,
      distributorId: distributors["AA_FILMS"],
      invoiceId: inv1.id,
      amount: 11800000,
      paymentType: "ADVANCE",
      paymentMethod: "RTGS_NEFT",
      transactionRef: "HDFCR2026082800192837",
      receiptUrl: "https://movieflow-cdn.internal/receipts/rec-aa-001.pdf",
      notes: "Full payment cleared via HDFC RTGS",
      status: "COMPLETED",
      verifiedAt: new Date("2026-08-28"),
      verifiedBy: "Neha Sharma (Finance Head)",
      paidAt: new Date("2026-08-28"),
    },
  });

  // Invoice 2 (Partially Paid)
  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-AA-102",
      companyId: company.id,
      dealId: aaDeal.id,
      distributorId: distributors["AA_FILMS"],
      amountBeforeTax: 8000000,
      cgstAmount: 720000,
      sgstAmount: 720000,
      igstAmount: 0,
      totalAmount: 9440000,
      paidAmount: 5000000,
      balanceAmount: 4440000,
      dueDate: new Date(Date.now() + 86400000 * 7), // Due in 7 days
      status: "PARTIALLY_PAID",
      notes: "Week 2 Theatrical Revenue Share Billing",
    },
  });

  const pay2 = await prisma.payment.create({
    data: {
      paymentNumber: "PAY-2026-002",
      companyId: company.id,
      dealId: aaDeal.id,
      distributorId: distributors["AA_FILMS"],
      invoiceId: inv2.id,
      amount: 5000000,
      paymentType: "INVOICE_PAYMENT",
      paymentMethod: "BANK_TRANSFER",
      transactionRef: "HDFCN2026100509988112",
      receiptUrl: "https://movieflow-cdn.internal/receipts/rec-aa-002.pdf",
      notes: "Part payment received. Remaining ₹44.40L due next week.",
      status: "COMPLETED",
      verifiedAt: new Date(),
      verifiedBy: "Neha Sharma (Finance Head)",
      paidAt: new Date(),
    },
  });

  // Invoice 3 (Overdue Invoice for Warner Bros)
  const inv3 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-WB-201",
      companyId: company.id,
      dealId: wbDeal.id,
      distributorId: distributors["WB_IND"],
      amountBeforeTax: 12000000,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 2160000,
      totalAmount: 14160000,
      paidAmount: 0,
      balanceAmount: 14160000,
      dueDate: new Date(Date.now() - 86400000 * 15), // 15 days overdue
      status: "OVERDUE",
      notes: "North India Territory Minimum Guarantee Settlement - Overdue",
    },
  });

  // Invoice 4 (Issued for UFO Moviez)
  const inv4 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-UFO-301",
      companyId: company.id,
      dealId: ufoDeal.id,
      distributorId: distributors["UFO"],
      amountBeforeTax: 6000000,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 1080000,
      totalAmount: 7080000,
      paidAmount: 0,
      balanceAmount: 7080000,
      dueDate: new Date(Date.now() + 86400000 * 10),
      status: "ISSUED",
      notes: "South India Circuit Week 2 Revenue Split Billing",
    },
  });

  // ─── 12. Financial Ledgers (DistributorLedger) ─────────────────────────────
  console.log("📖 Writing double-entry distributor ledger logs...");

  // AA Films Ledger:
  // 1. Opening Balance
  await prisma.distributorLedger.create({
    data: {
      companyId: company.id,
      distributorId: distributors["AA_FILMS"],
      entryDate: new Date("2026-08-01"),
      entryType: "DEBIT",
      category: "OPENING_BALANCE",
      referenceNumber: "OB-2026-AA",
      description: "Financial Year 2026-27 Opening Balance",
      debitAmount: 0,
      creditAmount: 0,
      runningBalance: 0,
      createdBy: "System Initialization",
    },
  });

  // 2. Invoice 1 Debit (₹1.18 Cr billed)
  await prisma.distributorLedger.create({
    data: {
      companyId: company.id,
      distributorId: distributors["AA_FILMS"],
      entryDate: new Date("2026-08-15"),
      entryType: "DEBIT",
      category: "INVOICE",
      referenceNumber: "INV-2026-AA-101",
      description: "Tax Invoice Issued: Stree 3 Minimum Guarantee Week 1",
      debitAmount: 11800000,
      creditAmount: 0,
      runningBalance: 11800000,
      invoiceId: inv1.id,
      createdBy: "Neha Sharma",
    },
  });

  // 3. Payment 1 Credit (₹1.18 Cr received)
  await prisma.distributorLedger.create({
    data: {
      companyId: company.id,
      distributorId: distributors["AA_FILMS"],
      entryDate: new Date("2026-08-28"),
      entryType: "CREDIT",
      category: "PAYMENT",
      referenceNumber: "PAY-2026-001",
      description: "Payment Received via RTGS (Ref: HDFCR2026082800192837)",
      debitAmount: 0,
      creditAmount: 11800000,
      runningBalance: 0,
      paymentId: pay1.id,
      invoiceId: inv1.id,
      createdBy: "Neha Sharma",
    },
  });

  // 4. Invoice 2 Debit (₹94.40L billed)
  await prisma.distributorLedger.create({
    data: {
      companyId: company.id,
      distributorId: distributors["AA_FILMS"],
      entryDate: new Date("2026-09-25"),
      entryType: "DEBIT",
      category: "INVOICE",
      referenceNumber: "INV-2026-AA-102",
      description: "Tax Invoice Issued: Stree 3 Theatrical Revenue Share Week 2",
      debitAmount: 9440000,
      creditAmount: 0,
      runningBalance: 9440000,
      invoiceId: inv2.id,
      createdBy: "Neha Sharma",
    },
  });

  // 5. Payment 2 Credit (₹50.00L partial payment) -> Balance: ₹44.40L
  await prisma.distributorLedger.create({
    data: {
      companyId: company.id,
      distributorId: distributors["AA_FILMS"],
      entryDate: new Date("2026-10-05"),
      entryType: "CREDIT",
      category: "PAYMENT",
      referenceNumber: "PAY-2026-002",
      description: "Partial Payment Received via NEFT (Ref: HDFCN2026100509988112)",
      debitAmount: 0,
      creditAmount: 5000000,
      runningBalance: 4440000,
      paymentId: pay2.id,
      invoiceId: inv2.id,
      createdBy: "Neha Sharma",
    },
  });

  // Warner Bros Ledger:
  await prisma.distributorLedger.create({
    data: {
      companyId: company.id,
      distributorId: distributors["WB_IND"],
      entryDate: new Date("2026-09-10"),
      entryType: "DEBIT",
      category: "INVOICE",
      referenceNumber: "INV-2026-WB-201",
      description: "Tax Invoice Issued: North India Minimum Guarantee Billing",
      debitAmount: 14160000,
      creditAmount: 0,
      runningBalance: 14160000,
      invoiceId: inv3.id,
      createdBy: "Neha Sharma",
    },
  });

  // UFO Moviez Ledger:
  await prisma.distributorLedger.create({
    data: {
      companyId: company.id,
      distributorId: distributors["UFO"],
      entryDate: new Date("2026-10-01"),
      entryType: "DEBIT",
      category: "INVOICE",
      referenceNumber: "INV-2026-UFO-301",
      description: "Tax Invoice Issued: South Circuit Revenue Share Split",
      debitAmount: 7080000,
      creditAmount: 0,
      runningBalance: 7080000,
      invoiceId: inv4.id,
      createdBy: "Neha Sharma",
    },
  });

  // ─── 13. Notifications & Alerts ───────────────────────────────────────────
  const notifications = [
    {
      title: "Overdue Invoice Alert: Warner Bros",
      message: "Invoice #INV-2026-WB-201 of ₹1.41 Cr is 15 days overdue. Automatic payment reminder generated.",
      type: "PAYMENT",
    },
    {
      title: "Payment Received: AA Films",
      message: "₹50.00 Lakhs credited for Invoice #INV-2026-AA-102 via HDFC NEFT. Balance outstanding: ₹44.40 Lakhs.",
      type: "PAYMENT",
    },
    {
      title: "Missing Collection Report Detected",
      message: "Cinepolis Ahmedabad Screen 3 collection report missing for Sunday 11th Oct. Alert sent to venue manager.",
      type: "SYSTEM",
    },
    {
      title: "High Yield Screen Performance",
      message: "PVR IMAX Juhu Screen 1 recorded 96.4% occupancy with ₹8.9 Lakhs single-day gross.",
      type: "DEAL",
    },
  ];

  const admin = await prisma.user.findFirst({ where: { email: "admin@movieflow.com" } });
  for (const n of notifications) {
    await prisma.notification.create({
      data: {
        companyId: company.id,
        userId: admin?.id,
        title: n.title,
        message: n.message,
        type: n.type,
      },
    });
  }

  console.log("✅ Seed complete! Real Pan-India distributor, screen collections, invoices, and ledgers ready.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
