"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { addWeeks, addMonths, addYears } from "date-fns";

function calcNextDueDate(
  frequency: string,
  interval: number,
  from: Date = new Date()
): Date {
  switch (frequency) {
    case "WEEKLY":     return addWeeks(from, interval);
    case "MONTHLY":    return addMonths(from, interval);
    case "QUARTERLY":  return addMonths(from, 3 * interval);
    case "SEMIANNUAL": return addMonths(from, 6 * interval);
    case "ANNUAL":     return addYears(from, interval);
    case "CUSTOM":     return addMonths(from, interval);
    default:           return addMonths(from, 1);
  }
}

export async function getMaintenanceTasks() {
  return prisma.maintenanceTask.findMany({
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      property: { select: { id: true, name: true } },
      vendor: { select: { id: true, companyName: true } },
    },
  });
}

export async function createMaintenanceTask(data: {
  title: string;
  notes?: string;
  dueDate?: string;
  priority: string;
  status: string;
  propertyId?: string;
  vendorId?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  recurrenceInterval?: string;
  estimatedCost?: string;
  actualCost?: string;
}) {
  const isRecurring = data.isRecurring ?? false;
  const interval = parseInt(data.recurrenceInterval ?? "1") || 1;
  const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;

  const nextDueDate =
    isRecurring && data.recurrenceFrequency && dueDate
      ? calcNextDueDate(data.recurrenceFrequency, interval, dueDate)
      : undefined;

  await prisma.maintenanceTask.create({
    data: {
      title: data.title,
      notes: data.notes,
      dueDate,
      priority: data.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      status: data.status as "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
      isRecurring,
      recurrenceFrequency: isRecurring
        ? (data.recurrenceFrequency as "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL" | "CUSTOM")
        : undefined,
      recurrenceInterval: isRecurring ? interval : undefined,
      nextDueDate,
      estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : undefined,
      actualCost: data.actualCost ? parseFloat(data.actualCost) : undefined,
      ...(data.propertyId ? { property: { connect: { id: data.propertyId } } } : {}),
      ...(data.vendorId ? { vendor: { connect: { id: data.vendorId } } } : {}),
    },
  });
  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard");
}

export async function updateMaintenanceTask(
  id: string,
  data: {
    title: string;
    notes?: string;
    dueDate?: string;
    priority: string;
    status: string;
    propertyId?: string;
    vendorId?: string;
    isRecurring?: boolean;
    recurrenceFrequency?: string;
    recurrenceInterval?: string;
    estimatedCost?: string;
    actualCost?: string;
  }
) {
  const isRecurring = data.isRecurring ?? false;
  const interval = parseInt(data.recurrenceInterval ?? "1") || 1;
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const nextDueDate =
    isRecurring && data.recurrenceFrequency && dueDate
      ? calcNextDueDate(data.recurrenceFrequency, interval, dueDate)
      : null;

  const existing = await prisma.maintenanceTask.findUnique({ where: { id } });
  const completingNow =
    existing?.status !== "COMPLETED" && data.status === "COMPLETED";

  await prisma.maintenanceTask.update({
    where: { id },
    data: {
      title: data.title,
      notes: data.notes,
      dueDate,
      priority: data.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      status: data.status as "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
      isRecurring,
      recurrenceFrequency: isRecurring
        ? (data.recurrenceFrequency as "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL" | "CUSTOM")
        : null,
      recurrenceInterval: isRecurring ? interval : null,
      nextDueDate,
      lastCompletedAt: completingNow ? new Date() : undefined,
      estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : null,
      actualCost: data.actualCost ? parseFloat(data.actualCost) : null,
      property: data.propertyId ? { connect: { id: data.propertyId } } : { disconnect: true },
      vendor: data.vendorId ? { connect: { id: data.vendorId } } : { disconnect: true },
    },
  });

  // Auto-spawn next occurrence when a recurring task is completed
  if (completingNow && isRecurring && data.recurrenceFrequency && nextDueDate) {
    const spawnNextDue = calcNextDueDate(data.recurrenceFrequency, interval, nextDueDate);
    const winStart = new Date(nextDueDate); winStart.setDate(winStart.getDate() - 1);
    const winEnd = new Date(nextDueDate); winEnd.setDate(winEnd.getDate() + 1);
    const duplicate = await prisma.maintenanceTask.findFirst({
      where: {
        title: data.title,
        isRecurring: true,
        status: { in: ["PENDING", "SCHEDULED"] },
        dueDate: { gte: winStart, lte: winEnd },
        ...(data.propertyId ? { propertyId: data.propertyId } : {}),
      },
    });
    if (!duplicate) {
      await prisma.maintenanceTask.create({
        data: {
          title: data.title,
          notes: data.notes,
          dueDate: nextDueDate,
          priority: data.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          status: "PENDING",
          isRecurring: true,
          recurrenceFrequency: data.recurrenceFrequency as "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL" | "CUSTOM",
          recurrenceInterval: interval,
          nextDueDate: spawnNextDue,
          ...(data.propertyId ? { property: { connect: { id: data.propertyId } } } : {}),
          ...(data.vendorId ? { vendor: { connect: { id: data.vendorId } } } : {}),
        },
      });
    }
  }

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard");
}

export async function completeMaintenanceTask(id: string, actualCost?: string) {
  const task = await prisma.maintenanceTask.findUnique({ where: { id } });
  if (!task) return;

  await prisma.maintenanceTask.update({
    where: { id },
    data: {
      status: "COMPLETED",
      lastCompletedAt: new Date(),
      actualCost: actualCost ? parseFloat(actualCost) : undefined,
    },
  });

  if (task.isRecurring && task.recurrenceFrequency && task.recurrenceInterval) {
    const baseDue = task.nextDueDate ?? task.dueDate ?? new Date();
    const nextDue = calcNextDueDate(task.recurrenceFrequency, task.recurrenceInterval, baseDue);
    const spawnNext = calcNextDueDate(task.recurrenceFrequency, task.recurrenceInterval, nextDue);

    const windowStart = new Date(nextDue); windowStart.setDate(windowStart.getDate() - 1);
    const windowEnd = new Date(nextDue); windowEnd.setDate(windowEnd.getDate() + 1);
    const duplicate = await prisma.maintenanceTask.findFirst({
      where: {
        title: task.title,
        isRecurring: true,
        status: { in: ["PENDING", "SCHEDULED"] },
        dueDate: { gte: windowStart, lte: windowEnd },
        ...(task.propertyId ? { propertyId: task.propertyId } : {}),
      },
    });

    if (!duplicate) {
      await prisma.maintenanceTask.create({
        data: {
          title: task.title,
          notes: task.notes,
          dueDate: nextDue,
          priority: task.priority,
          status: "PENDING",
          isRecurring: true,
          recurrenceFrequency: task.recurrenceFrequency,
          recurrenceInterval: task.recurrenceInterval,
          nextDueDate: spawnNext,
          ...(task.propertyId ? { property: { connect: { id: task.propertyId } } } : {}),
          ...(task.vendorId ? { vendor: { connect: { id: task.vendorId } } } : {}),
        },
      });
    }
  }

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard");
}

export async function deleteMaintenanceTask(id: string) {
  await prisma.maintenanceTask.delete({ where: { id } });
  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard");
}
