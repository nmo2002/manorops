"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getProperties() {
  return prisma.property.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { tasks: true, vendors: true, documents: true, assets: true } },
    },
  });
}

export async function createProperty(data: {
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  propertyType: string;
  imageUrl?: string;
  notes?: string;
  annualBudget?: string;
}) {
  await prisma.property.create({
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      propertyType: data.propertyType as "PRIMARY" | "SECONDARY" | "VACATION" | "INVESTMENT" | "OTHER",
      imageUrl: data.imageUrl,
      notes: data.notes,
      annualBudget: data.annualBudget ? parseFloat(data.annualBudget) : undefined,
    },
  });
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard");
}

export async function updateProperty(
  id: string,
  data: {
    name: string;
    address: string;
    city?: string;
    state?: string;
    country?: string;
    propertyType: string;
    imageUrl?: string;
    notes?: string;
    annualBudget?: string;
  }
) {
  await prisma.property.update({
    where: { id },
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      propertyType: data.propertyType as "PRIMARY" | "SECONDARY" | "VACATION" | "INVESTMENT" | "OTHER",
      imageUrl: data.imageUrl,
      notes: data.notes,
      annualBudget: data.annualBudget ? parseFloat(data.annualBudget) : null,
    },
  });
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard");
}

export async function deleteProperty(id: string) {
  await prisma.property.delete({ where: { id } });
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard");
}
