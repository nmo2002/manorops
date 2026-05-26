import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding ManorOps demo data...");

  // Demo org
  const org = await prisma.org.create({
    data: { name: "Hargrove Family Office" },
  });

  // Demo user
  await prisma.user.create({
    data: {
      name: "Edward Hargrove",
      email: "edward@hargrove.com",
      role: "OWNER",
      orgId: org.id,
    },
  });

  // Properties
  const hamptons = await prisma.property.create({
    data: {
      name: "The Hamptons Estate",
      address: "14 Meadow Lane",
      city: "Southampton",
      state: "NY",
      country: "USA",
      propertyType: "PRIMARY",
      imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      notes: "8,400 sq ft main residence with pool house, tennis court, and guest cottage.",
      orgId: org.id,
    },
  });

  const aspen = await prisma.property.create({
    data: {
      name: "Aspen Mountain Lodge",
      address: "220 Red Mountain Road",
      city: "Aspen",
      state: "CO",
      country: "USA",
      propertyType: "VACATION",
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
      notes: "Ski-in ski-out chalet. Open seasonally Oct–Apr.",
      orgId: org.id,
    },
  });

  const palmBeach = await prisma.property.create({
    data: {
      name: "Palm Beach Residence",
      address: "301 S Ocean Blvd",
      city: "Palm Beach",
      state: "FL",
      country: "USA",
      propertyType: "SECONDARY",
      imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      notes: "Oceanfront property. Used January–March.",
      orgId: org.id,
    },
  });

  // Vendors
  const eliteHVAC = await prisma.vendor.create({
    data: {
      companyName: "Elite Climate Systems",
      serviceType: "HVAC",
      contactName: "Robert Chen",
      phone: "(631) 555-0142",
      email: "robert@eliteclimate.com",
      status: "ACTIVE",
      propertyId: hamptons.id,
      orgId: org.id,
    },
  });

  const premierePool = await prisma.vendor.create({
    data: {
      companyName: "Premiere Pool & Spa",
      serviceType: "Pool Maintenance",
      contactName: "Marco Vitale",
      phone: "(631) 555-0287",
      email: "marco@premierepool.com",
      status: "ACTIVE",
      propertyId: hamptons.id,
      orgId: org.id,
    },
  });

  const alpineBuilders = await prisma.vendor.create({
    data: {
      companyName: "Alpine Ridge Builders",
      serviceType: "General Contractor",
      contactName: "James Whitfield",
      phone: "(970) 555-0311",
      email: "james@alpineridge.com",
      status: "ACTIVE",
      propertyId: aspen.id,
      orgId: org.id,
    },
  });

  const southernSecurity = await prisma.vendor.create({
    data: {
      companyName: "Southern Shield Security",
      serviceType: "Security Systems",
      contactName: "Patricia Monroe",
      phone: "(561) 555-0198",
      email: "pmonroe@southernshield.com",
      status: "ACTIVE",
      propertyId: palmBeach.id,
      orgId: org.id,
    },
  });

  await prisma.vendor.create({
    data: {
      companyName: "Hargrove Grounds & Gardens",
      serviceType: "Landscaping",
      contactName: "Luis Fernandez",
      phone: "(631) 555-0401",
      email: "luis@hggarden.com",
      status: "ACTIVE",
      orgId: org.id,
    },
  });

  // Maintenance Tasks
  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 86400000);

  await prisma.maintenanceTask.createMany({
    data: [
      {
        title: "HVAC seasonal inspection & filter replacement",
        notes: "Full system check before summer season. Replace all filters.",
        dueDate: inDays(7),
        priority: "HIGH",
        status: "SCHEDULED",
        propertyId: hamptons.id,
        vendorId: eliteHVAC.id,
      },
      {
        title: "Pool opening — chemical balance & equipment check",
        notes: "Open pool for Memorial Day weekend. Test water chemistry.",
        dueDate: inDays(14),
        priority: "HIGH",
        status: "PENDING",
        propertyId: hamptons.id,
        vendorId: premierePool.id,
      },
      {
        title: "Guest cottage roof inspection",
        notes: "Inspect for winter damage after heavy snowfall reports in area.",
        dueDate: inDays(21),
        priority: "MEDIUM",
        status: "PENDING",
        propertyId: hamptons.id,
      },
      {
        title: "Lodge boiler winterization check",
        notes: "Annual service before season close. Check pressure relief valves.",
        dueDate: inDays(-3),
        priority: "URGENT",
        status: "COMPLETED",
        propertyId: aspen.id,
        vendorId: alpineBuilders.id,
      },
      {
        title: "Security camera system upgrade — east wing",
        notes: "Replace 6 cameras with 4K models. Update NVR firmware.",
        dueDate: inDays(10),
        priority: "MEDIUM",
        status: "SCHEDULED",
        propertyId: palmBeach.id,
        vendorId: southernSecurity.id,
      },
      {
        title: "Ocean-facing fence restoration",
        notes: "Salt corrosion on perimeter fence posts. Sandblast and repaint.",
        dueDate: inDays(30),
        priority: "LOW",
        status: "PENDING",
        propertyId: palmBeach.id,
      },
      {
        title: "Generator load test — all properties",
        notes: "Monthly load test required per insurance policy.",
        dueDate: inDays(5),
        priority: "HIGH",
        status: "PENDING",
      },
    ],
  });

  // Documents
  await prisma.document.createMany({
    data: [
      {
        title: "Hamptons Residence — Homeowner's Insurance Policy",
        category: "INSURANCE",
        expirationDate: inDays(180),
        notes: "AIG Private Client. Annual premium: $48,200.",
        propertyId: hamptons.id,
      },
      {
        title: "Aspen Lodge — Property Insurance Certificate",
        category: "INSURANCE",
        expirationDate: inDays(290),
        propertyId: aspen.id,
      },
      {
        title: "Generac Whole-Home Generator Warranty",
        category: "WARRANTY",
        expirationDate: inDays(730),
        notes: "Model 22000-EXL. Serial: GN22-881245.",
        propertyId: hamptons.id,
      },
      {
        title: "Crestron Home Automation — Service Contract",
        category: "CONTRACT",
        expirationDate: inDays(60),
        notes: "Annual support contract. Up for renewal. Contact: Crestron Premier Services.",
        propertyId: hamptons.id,
      },
      {
        title: "Hamptons — Property Deed",
        category: "DEED",
        propertyId: hamptons.id,
      },
      {
        title: "Aspen — Property Deed",
        category: "DEED",
        propertyId: aspen.id,
      },
      {
        title: "Palm Beach — Property Tax Assessment 2024",
        category: "TAX",
        expirationDate: inDays(365),
        propertyId: palmBeach.id,
      },
      {
        title: "Palm Beach — Security Monitoring Agreement",
        category: "CONTRACT",
        expirationDate: inDays(180),
        propertyId: palmBeach.id,
      },
    ],
  });

  // Assets
  await prisma.asset.createMany({
    data: [
      {
        itemName: "Sub-Zero 48\" Refrigerator",
        room: "Main Kitchen",
        estimatedValue: 14500,
        purchaseDate: new Date("2021-06-15"),
        warrantyExpiration: new Date("2026-06-15"),
        propertyId: hamptons.id,
      },
      {
        itemName: "Wolf Dual Fuel Range",
        room: "Main Kitchen",
        estimatedValue: 12800,
        purchaseDate: new Date("2021-06-15"),
        warrantyExpiration: new Date("2026-06-15"),
        propertyId: hamptons.id,
      },
      {
        itemName: "Crestron Home Automation System",
        room: "Utility Room",
        estimatedValue: 85000,
        purchaseDate: new Date("2019-09-01"),
        propertyId: hamptons.id,
        notes: "Whole-home AV, lighting, and climate control.",
      },
      {
        itemName: "Generac 22kW Whole-Home Generator",
        room: "Exterior — North Side",
        estimatedValue: 22000,
        purchaseDate: new Date("2020-04-10"),
        warrantyExpiration: new Date("2027-04-10"),
        propertyId: hamptons.id,
      },
      {
        itemName: "Viking Pool Heater",
        room: "Pool Equipment Room",
        estimatedValue: 8500,
        purchaseDate: new Date("2022-05-01"),
        propertyId: hamptons.id,
      },
      {
        itemName: "Lynx 54\" Built-In Grill",
        room: "Outdoor Kitchen",
        estimatedValue: 6200,
        purchaseDate: new Date("2021-07-20"),
        propertyId: hamptons.id,
      },
      {
        itemName: "Ski Equipment Storage Locker System",
        room: "Mudroom",
        estimatedValue: 9500,
        purchaseDate: new Date("2018-12-01"),
        propertyId: aspen.id,
      },
      {
        itemName: "Radiant Floor Heating System",
        room: "All Living Areas",
        estimatedValue: 55000,
        purchaseDate: new Date("2015-08-01"),
        propertyId: aspen.id,
      },
      {
        itemName: "Lutron Whole-Home Lighting System",
        room: "Utility Room",
        estimatedValue: 32000,
        purchaseDate: new Date("2020-01-15"),
        propertyId: palmBeach.id,
      },
      {
        itemName: "Raypak Pool/Spa Heater",
        room: "Pool Equipment Room",
        estimatedValue: 4800,
        purchaseDate: new Date("2023-02-10"),
        warrantyExpiration: new Date("2028-02-10"),
        propertyId: palmBeach.id,
      },
    ],
  });

  // Recurring maintenance tasks
  await prisma.maintenanceTask.createMany({
    data: [
      {
        title: "Pool chemical & equipment check",
        notes: "Test pH, chlorine, alkalinity. Inspect pump and filter.",
        dueDate: inDays(3),
        priority: "MEDIUM",
        status: "PENDING",
        isRecurring: true,
        recurrenceFrequency: "WEEKLY",
        recurrenceInterval: 1,
        nextDueDate: inDays(10),
        propertyId: hamptons.id,
      },
      {
        title: "HVAC filter replacement",
        notes: "Replace all HVAC filters across the main house and pool house.",
        dueDate: inDays(30),
        priority: "MEDIUM",
        status: "PENDING",
        isRecurring: true,
        recurrenceFrequency: "MONTHLY",
        recurrenceInterval: 1,
        nextDueDate: inDays(60),
        propertyId: hamptons.id,
      },
      {
        title: "Generator load test",
        notes: "Run generator under load for 30 minutes. Log readings.",
        dueDate: inDays(5),
        priority: "HIGH",
        status: "PENDING",
        isRecurring: true,
        recurrenceFrequency: "MONTHLY",
        recurrenceInterval: 1,
        nextDueDate: inDays(35),
      },
      {
        title: "Fire extinguisher inspection",
        notes: "Check pressure gauge and inspection tag on all units.",
        dueDate: inDays(45),
        priority: "HIGH",
        status: "PENDING",
        isRecurring: true,
        recurrenceFrequency: "SEMIANNUAL",
        recurrenceInterval: 1,
        nextDueDate: inDays(225),
        propertyId: hamptons.id,
      },
      {
        title: "Aspen lodge deep clean & inspection",
        notes: "Full property inspection before season opening. Check all systems.",
        dueDate: inDays(120),
        priority: "HIGH",
        status: "PENDING",
        isRecurring: true,
        recurrenceFrequency: "ANNUAL",
        recurrenceInterval: 1,
        nextDueDate: inDays(485),
        propertyId: aspen.id,
      },
    ],
  });

  // Operating Manuals
  await prisma.operatingManual.createMany({
    data: [
      {
        propertyId: hamptons.id,
        accessInstructions:
          "Main gate code: 4821#. Guest entry: call box at gate, dial ext. 01. Key lockbox at rear mudroom entry: code 7734. Spare keys stored in estate manager office, drawer labeled 'Hamptons Main'.",
        utilityShutoffs:
          "Main water shutoff: basement utility room, red valve on north wall. Electrical panel: basement east wall, labeled. Generator transfer switch adjacent to panel. Gas main: exterior, north side of house, yellow handle.",
        wifiNetwork: "Hargrove-Estate-5G",
        wifiPassword: "Meadow1492!",
        securityNotes:
          "Monitored by ADT Premier. Account #HGE-0041. Disarm within 45 seconds of entry. Motion sensors active in all ground-floor rooms when armed. Camera NVR in basement IT closet — 30-day retention.",
        alarmCode: "4821",
        emergencyContacts:
          "Estate Manager: Margaret Collins — (631) 555-0910\nHVAC Emergency: Elite Climate 24hr — (631) 555-0142\nPlumber: Northshore Plumbing — (631) 555-0267\nElectrician: Island Electric — (631) 555-0388\nNearest Hospital: Southampton Hospital — (631) 726-8200",
        trashSchedule:
          "Trash pickup: Tuesday & Friday AM — bins to curb by 7am.\nRecycling: Every other Wednesday.\nHazardous waste: Southampton Town facility, first Saturday of month.",
        houseRules:
          "No outdoor shoes past the foyer. Pool hours: 7am–10pm. No smoking on premises. Guests must be registered with estate manager 48hr in advance. Pets restricted to mudroom and outdoor areas.",
        generalNotes:
          "Pool house has separate Nest thermostat — code same as main. Guest cottage WiFi: Hargrove-Guest / HamptonGuest24. Wine cellar key on estate manager keyring.",
      },
      {
        propertyId: aspen.id,
        accessInstructions:
          "Front door: Schlage smart lock, code 9156. Ski storage: mudroom code 3344. Parking: 3-car heated garage, door opener in each vehicle.",
        utilityShutoffs:
          "Water main: utility closet off mudroom. Electrical: panel in garage, east wall. Radiant heat controls: thermostat panel in hallway near master suite.",
        wifiNetwork: "Hargrove-Aspen",
        wifiPassword: "Snowpack2024!",
        securityNotes: "Ring system, monitored locally. Code: 9156. Outdoor cameras cover all entry points.",
        alarmCode: "9156",
        emergencyContacts:
          "Caretaker: Dave Ritchie — (970) 555-0522\nAlpine Ridge Builders emergency — (970) 555-0311\nAspen Valley Hospital — (970) 925-1120",
        trashSchedule: "Trash: Monday AM. Recycling: Every other Monday. No glass recycling — compost bin on back deck.",
        houseRules: "Ski gear must be cleaned and dried in mudroom before entering main house. Hot tub hours: 7am–11pm. No outdoor fires without caretaker present.",
        generalNotes: "Lodge open seasonally Oct-Apr. Shutoff procedure on closing checklist in kitchen drawer. Snowmelt system on deck auto-activates below 28F.",
      },
      {
        propertyId: palmBeach.id,
        accessInstructions:
          "Ocean Blvd gate: code 6632. Front door: key from lockbox (code 2281). Parking in gated motor court — 4 spaces.",
        utilityShutoffs:
          "Water main: south side of house exterior. Electrical panel: garage utility room. Hurricane shutters: stored in east garage bay — deployment instructions posted inside door.",
        wifiNetwork: "Hargrove-PalmBeach",
        wifiPassword: "OceanView55!",
        securityNotes: "Southern Shield Security. 24hr monitoring. Panic button at master suite nightstand. Code: 6632.",
        alarmCode: "6632",
        emergencyContacts:
          "Household Manager: Sylvia Torres — (561) 555-0741\nSouthern Shield 24hr — (561) 555-0198\nGood Samaritan Medical Center — (561) 655-5511",
        trashSchedule: "Trash: Wednesday & Saturday. Recycling: Wednesday. Pool service: Friday AM.",
        houseRules: "Beach access via private path, gate code same as front. Pool temperature maintained at 84F. No outdoor amplified music after 9pm.",
        generalNotes: "Hurricane prep checklist in kitchen binder. Flood insurance policy in document vault. A/C filters serviced monthly by Estate Air Services.",
      },
    ],
  });

  // Reminders
  await prisma.reminder.createMany({
    data: [
      {
        message: "Crestron service contract renewal due — contact Crestron Premier Services",
        remindAt: inDays(7),
        propertyId: hamptons.id,
      },
      {
        message: "Review and renew AIG homeowner's insurance policy",
        remindAt: inDays(60),
        propertyId: hamptons.id,
      },
      {
        message: "Schedule aspen lodge pre-season inspection with Alpine Ridge",
        remindAt: inDays(4),
        propertyId: aspen.id,
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
