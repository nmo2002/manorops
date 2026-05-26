import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  if (!filename || !request.body) {
    return NextResponse.json({ error: "filename required" }, { status: 400 });
  }

  const blob = await put(`documents/${Date.now()}-${filename}`, request.body, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
