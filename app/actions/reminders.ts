"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function dismissReminder(id: string) {
  await prisma.reminder.update({ where: { id }, data: { isDismissed: true } });
  revalidatePath("/dashboard");
}

export async function createReminder(data: {
  message: string;
  remindAt: string;
  propertyId?: string;
  taskId?: string;
}) {
  await prisma.reminder.create({
    data: {
      message: data.message,
      remindAt: new Date(data.remindAt),
      ...(data.propertyId ? { property: { connect: { id: data.propertyId } } } : {}),
      ...(data.taskId ? { task: { connect: { id: data.taskId } } } : {}),
    },
  });
  revalidatePath("/dashboard");
}

export async function deleteReminder(id: string) {
  await prisma.reminder.delete({ where: { id } });
  revalidatePath("/dashboard");
}
