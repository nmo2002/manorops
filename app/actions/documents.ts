"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getDocuments() {
  return prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: { property: { select: { id: true, name: true } } },
  });
}

export async function createDocument(data: {
  title: string;
  category: string;
  expirationDate?: string;
  notes?: string;
  fileUrl?: string;
  propertyId?: string;
}) {
  await prisma.document.create({
    data: {
      title: data.title,
      category: data.category as "INSURANCE" | "WARRANTY" | "CONTRACT" | "DEED" | "TAX" | "OTHER",
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      notes: data.notes,
      fileUrl: data.fileUrl,
      ...(data.propertyId ? { property: { connect: { id: data.propertyId } } } : {}),
    },
  });
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}

export async function updateDocument(
  id: string,
  data: {
    title: string;
    category: string;
    expirationDate?: string;
    notes?: string;
    fileUrl?: string;
    propertyId?: string;
  }
) {
  await prisma.document.update({
    where: { id },
    data: {
      title: data.title,
      category: data.category as "INSURANCE" | "WARRANTY" | "CONTRACT" | "DEED" | "TAX" | "OTHER",
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      notes: data.notes,
      fileUrl: data.fileUrl,
      property: data.propertyId
        ? { connect: { id: data.propertyId } }
        : { disconnect: true },
    },
  });
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}

export async function deleteDocument(id: string) {
  await prisma.document.delete({ where: { id } });
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}
