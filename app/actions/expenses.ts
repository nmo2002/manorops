"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createExpense(data: {
  description: string;
  amount: string;
  category: string;
  date: string;
  notes?: string;
  propertyId?: string;
  vendorId?: string;
}) {
  await prisma.expense.create({
    data: {
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category as any,
      date: new Date(data.date),
      notes: data.notes,
      ...(data.propertyId ? { property: { connect: { id: data.propertyId } } } : {}),
      ...(data.vendorId ? { vendor: { connect: { id: data.vendorId } } } : {}),
    },
  });
  revalidatePath("/dashboard/financials");
  revalidatePath("/dashboard");
}

export async function updateExpense(
  id: string,
  data: {
    description: string;
    amount: string;
    category: string;
    date: string;
    notes?: string;
    propertyId?: string;
    vendorId?: string;
  }
) {
  await prisma.expense.update({
    where: { id },
    data: {
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category as any,
      date: new Date(data.date),
      notes: data.notes,
      property: data.propertyId ? { connect: { id: data.propertyId } } : { disconnect: true },
      vendor: data.vendorId ? { connect: { id: data.vendorId } } : { disconnect: true },
    },
  });
  revalidatePath("/dashboard/financials");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/dashboard/financials");
  revalidatePath("/dashboard");
}
