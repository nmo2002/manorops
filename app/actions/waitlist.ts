"use server";

import { prisma } from "@/lib/prisma";

export async function joinWaitlist(email: string): Promise<{ success: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  try {
    await prisma.waitlistEntry.create({ data: { email: trimmed } });
    return { success: true, message: "You're on the list — we'll be in touch." };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { success: true, message: "You're already on the list!" };
    }
    console.error("Waitlist error:", err);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
