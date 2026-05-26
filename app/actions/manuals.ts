"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getOperatingManual(propertyId: string) {
  return prisma.operatingManual.findUnique({ where: { propertyId } });
}

export async function upsertOperatingManual(
  propertyId: string,
  data: {
    accessInstructions?: string;
    utilityShutoffs?: string;
    wifiNetwork?: string;
    wifiPassword?: string;
    securityNotes?: string;
    alarmCode?: string;
    emergencyContacts?: string;
    trashSchedule?: string;
    houseRules?: string;
    generalNotes?: string;
  }
) {
  await prisma.operatingManual.upsert({
    where: { propertyId },
    update: data,
    create: { propertyId, ...data },
  });
  revalidatePath(`/dashboard/properties/${propertyId}/manual`);
}
