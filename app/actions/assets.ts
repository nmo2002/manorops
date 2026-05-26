"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getAssets() {
  return prisma.asset.findMany({
    orderBy: { itemName: "asc" },
    include: { property: { select: { id: true, name: true } } },
  });
}

export async function createAsset(data: {
  itemName: string;
  room?: string;
  estimatedValue?: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  notes?: string;
  propertyId?: string;
}) {
  await prisma.asset.create({
    data: {
      itemName: data.itemName,
      room: data.room,
      estimatedValue: data.estimatedValue ? parseFloat(data.estimatedValue) : undefined,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      warrantyExpiration: data.warrantyExpiration ? new Date(data.warrantyExpiration) : undefined,
      notes: data.notes,
      ...(data.propertyId ? { property: { connect: { id: data.propertyId } } } : {}),
    },
  });
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}

export async function updateAsset(
  id: string,
  data: {
    itemName: string;
    room?: string;
    estimatedValue?: string;
    purchaseDate?: string;
    warrantyExpiration?: string;
    notes?: string;
    propertyId?: string;
  }
) {
  await prisma.asset.update({
    where: { id },
    data: {
      itemName: data.itemName,
      room: data.room,
      estimatedValue: data.estimatedValue ? parseFloat(data.estimatedValue) : null,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      warrantyExpiration: data.warrantyExpiration ? new Date(data.warrantyExpiration) : null,
      notes: data.notes,
      property: data.propertyId
        ? { connect: { id: data.propertyId } }
        : { disconnect: true },
    },
  });
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}

export async function deleteAsset(id: string) {
  await prisma.asset.delete({ where: { id } });
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}
