import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tasks = await prisma.maintenanceTask.findMany({
    where: { isRecurring: true, status: { in: ["PENDING", "SCHEDULED"] } },
    orderBy: { createdAt: "asc" },
  });

  const seen = new Map<string, string>();
  const toDelete: string[] = [];

  for (const t of tasks) {
    const dueDateStr = t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "none";
    const key = `${t.title}||${t.propertyId ?? "none"}||${dueDateStr}`;
    if (seen.has(key)) {
      toDelete.push(t.id);
    } else {
      seen.set(key, t.id);
    }
  }

  if (toDelete.length === 0) {
    console.log("No duplicates found.");
    return;
  }

  console.log(`Deleting ${toDelete.length} duplicate recurring task(s)...`);
  await prisma.maintenanceTask.deleteMany({ where: { id: { in: toDelete } } });
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
