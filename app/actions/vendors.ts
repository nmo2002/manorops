"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getVendors() {
  return prisma.vendor.findMany({
    orderBy: { companyName: "asc" },
    include: { property: { select: { id: true, name: true } } },
  });
}

export async function createVendor(data: {
  companyName: string;
  serviceType: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  status: string;
  propertyId?: string;
}) {
  await prisma.vendor.create({
    data: {
      companyName: data.companyName,
      serviceType: data.serviceType,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      status: data.status as "ACTIVE" | "INACTIVE" | "PENDING",
      ...(data.propertyId ? { property: { connect: { id: data.propertyId } } } : {}),
    },
  });
  revalidatePath("/dashboard/vendors");
  revalidatePath("/dashboard");
}

export async function updateVendor(
  id: string,
  data: {
    companyName: string;
    serviceType: string;
    contactName?: string;
    phone?: string;
    email?: string;
    notes?: string;
    status: string;
    propertyId?: string;
  }
) {
  await prisma.vendor.update({
    where: { id },
    data: {
      companyName: data.companyName,
      serviceType: data.serviceType,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      status: data.status as "ACTIVE" | "INACTIVE" | "PENDING",
      property: data.propertyId
        ? { connect: { id: data.propertyId } }
        : { disconnect: true },
    },
  });
  revalidatePath("/dashboard/vendors");
  revalidatePath("/dashboard");
}

export async function deleteVendor(id: string) {
  await prisma.vendor.delete({ where: { id } });
  revalidatePath("/dashboard/vendors");
  revalidatePath("/dashboard");
}
