import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Running patch seed — adding recurring tasks, manuals, reminders...");

  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 86400000);

  // Find existing properties
  const hamptons = await prisma.property.findFirst({ where: { name: "The Hamptons Estate" } });
  const aspen = await prisma.property.findFirst({ where: { name: "Aspen Mountain Lodge" } });
  const palmBeach = await prisma.property.findFirst({ where: { name: "Palm Beach Residence" } });

  if (!hamptons || !aspen || !palmBeach) {
    throw new Error("Base properties not found — run full seed first");
  }

  // Recurring maintenance tasks (skip if already present)
  await prisma.maintenanceTask.createMany({
    skipDuplicates: true,
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
  console.log("✓ Recurring tasks added");

  // Operating Manuals (upsert so re-running is safe)
  await prisma.operatingManual.upsert({
    where: { propertyId: hamptons.id },
    update: {},
    create: {
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
  });

  await prisma.operatingManual.upsert({
    where: { propertyId: aspen.id },
    update: {},
    create: {
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
      houseRules:
        "Ski gear must be cleaned and dried in mudroom before entering main house. Hot tub hours: 7am–11pm. No outdoor fires without caretaker present.",
      generalNotes:
        "Lodge open seasonally Oct-Apr. Shutoff procedure on closing checklist in kitchen drawer. Snowmelt system on deck auto-activates below 28F.",
    },
  });

  await prisma.operatingManual.upsert({
    where: { propertyId: palmBeach.id },
    update: {},
    create: {
      propertyId: palmBeach.id,
      accessInstructions:
        "Ocean Blvd gate: code 6632. Front door: key from lockbox (code 2281). Parking in gated motor court — 4 spaces.",
      utilityShutoffs:
        "Water main: south side of house exterior. Electrical panel: garage utility room. Hurricane shutters: stored in east garage bay — deployment instructions posted inside door.",
      wifiNetwork: "Hargrove-PalmBeach",
      wifiPassword: "OceanView55!",
      securityNotes:
        "Southern Shield Security. 24hr monitoring. Panic button at master suite nightstand. Code: 6632.",
      alarmCode: "6632",
      emergencyContacts:
        "Household Manager: Sylvia Torres — (561) 555-0741\nSouthern Shield 24hr — (561) 555-0198\nGood Samaritan Medical Center — (561) 655-5511",
      trashSchedule: "Trash: Wednesday & Saturday. Recycling: Wednesday. Pool service: Friday AM.",
      houseRules:
        "Beach access via private path, gate code same as front. Pool temperature maintained at 84F. No outdoor amplified music after 9pm.",
      generalNotes:
        "Hurricane prep checklist in kitchen binder. Flood insurance policy in document vault. A/C filters serviced monthly by Estate Air Services.",
    },
  });
  console.log("✓ Operating manuals added");

  // Reminders (only add if none exist)
  const existingReminders = await prisma.reminder.count();
  if (existingReminders === 0) {
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
    console.log("✓ Reminders added");
  } else {
    console.log("✓ Reminders already present — skipped");
  }

  console.log("Patch seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
