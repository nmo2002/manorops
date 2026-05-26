import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ManualClient } from "./manual-client";

export default async function OperatingManualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, name: true, city: true, state: true },
  });

  if (!property) notFound();

  const manual = await prisma.operatingManual.findUnique({ where: { propertyId: id } });

  return <ManualClient property={property} manual={manual} />;
}
