import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.AUTH_GOOGLE_ID ?? "NOT SET";
  return NextResponse.json({
    clientIdSuffix: clientId.slice(-30),
    clientIdLength: clientId.length,
    nextauthUrl: process.env.NEXTAUTH_URL,
    hasSecret: !!process.env.AUTH_GOOGLE_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
  });
}
