import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({
      authenticated: true,
      role: session.role,
      userId: session.userId,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
