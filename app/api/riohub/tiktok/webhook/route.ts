import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRioHubConfig } from "@/lib/riohubTikTok";
import { buildRioHubOrderExternalId, upsertRioHubTikTokOrder } from "@/lib/riohubTikTokOrders";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-riohub-signature") ?? "";
  const secret = getRioHubConfig().signingSecret;

  if (!secret) {
    return NextResponse.json({ error: "Missing webhook signing secret" }, { status: 500 });
  }
  if (!verifyRioHubSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "bad signature" }, { status: 403 });
  }

  const payload = JSON.parse(rawBody);
  const eventId = payload?.event_id;
  const event = payload?.event;
  const data = payload?.data;

  if (!eventId || !event || !data?.order_id) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const existing = await prisma.rioHubWebhookEvent.findUnique({ where: { eventId } });
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const order = normalizeWebhookOrder(data);
  const result = await upsertRioHubTikTokOrder(order);
  const orderExternalId = buildRioHubOrderExternalId(order);

  try {
    await prisma.rioHubWebhookEvent.create({
      data: {
        eventId,
        event,
        orderExternalId,
        payload: rawBody,
      },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }

  return NextResponse.json({ ok: true, eventId, orderExternalId, result });
}

function verifyRioHubSignature(rawBody: string, header: string, secret: string) {
  const parts = new Map(
    header
      .split(",")
      .map((part) => part.trim().split("="))
      .filter((part): part is [string, string] => part.length === 2)
  );
  const timestamp = parts.get("t");
  const signature = parts.get("v1");
  if (!timestamp || !signature) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

function normalizeWebhookOrder(data: any) {
  return {
    ...data,
    sub_id: data.sub_id ?? data.subid,
    settlement_status: data.settlement_status ?? data.order_status_raw,
    commission_gmv: data.commission_gmv ?? data.gmv,
    create_time: data.create_time,
    update_time: data.update_time,
    est_commission: data.est_commission,
    actual_commission: data.actual_commission,
  };
}
