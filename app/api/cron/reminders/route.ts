import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [reminders, users] = await Promise.all([
    prisma.reminder.findMany({
      where: {
        isDismissed: false,
        emailSent: false,
        remindAt: { lte: new Date() },
      },
      include: {
        task: { select: { title: true } },
        document: { select: { title: true } },
        asset: { select: { itemName: true } },
        property: { select: { name: true } },
      },
    }),
    prisma.user.findMany({ select: { email: true } }),
  ]);

  if (reminders.length === 0 || users.length === 0) {
    return NextResponse.json({ sent: 0, total: 0 });
  }

  let sent = 0;
  for (const reminder of reminders) {
    for (const user of users) {
      try {
        await sendReminderEmail({
          to: user.email,
          message: reminder.message,
          remindAt: reminder.remindAt,
          taskTitle: reminder.task?.title,
          documentTitle: reminder.document?.title,
          assetName: reminder.asset?.itemName,
          propertyName: reminder.property?.name,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send reminder email to ${user.email}:`, err);
      }
    }
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { emailSent: true },
    });
  }

  return NextResponse.json({ sent, total: reminders.length });
}
