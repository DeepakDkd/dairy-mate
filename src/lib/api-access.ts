import { PaymentMethod, Role, Shift, MilkType } from "@prisma/client";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

type GuardSuccess<T> = { ok: true; data: T };
type GuardFailure = { ok: false; response: NextResponse };

type GuardResult<T> = GuardSuccess<T> | GuardFailure;

export function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export function parsePositiveInt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function parsePositiveNumber(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function parseNonNegativeNumber(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export function parseDateInput(value: unknown) {
  const parsed = value ? new Date(String(value)) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "CASH" || value === "UPI" || value === "BANK";
}

export function isShift(value: unknown): value is Shift {
  return value === "MORNING" || value === "EVENING";
}

export function isMilkType(value: unknown): value is MilkType {
  return value === "COW" || value === "BUFFALO";
}

export async function requireOwnedDairy(
  session: Session,
  dairyId: number
): Promise<GuardResult<{ id: number; ownerId: number }>> {
  if (session.user.role !== "OWNER") {
    return { ok: false, response: jsonError("Forbidden", 403) };
  }

  const dairy = await prisma.dairy.findFirst({
    where: {
      id: dairyId,
      ownerId: session.user.id,
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!dairy) {
    return { ok: false, response: jsonError("Dairy not found", 404) };
  }

  return { ok: true, data: dairy };
}

export async function requirePartyAccess(
  session: Session,
  options: {
    dairyId: number;
    partyId: number;
    role: "BUYER" | "SELLER";
  }
): Promise<
  GuardResult<{
    id: number;
    dairyId: number | null;
    firstName: string;
    lastName: string;
    role: Role;
  }>
> {
  const { dairyId, partyId, role } = options;

  if (session.user.role === role && session.user.id !== partyId) {
    return { ok: false, response: jsonError("Forbidden", 403) };
  }

  if (session.user.role !== "OWNER" && session.user.role !== role) {
    return { ok: false, response: jsonError("Forbidden", 403) };
  }

  if (session.user.role === "OWNER") {
    const dairyAccess = await requireOwnedDairy(session, dairyId);
    if (!dairyAccess.ok) {
      return dairyAccess;
    }
  }

  const party = await prisma.user.findFirst({
    where: {
      id: partyId,
      dairyId,
      role,
    },
    select: {
      id: true,
      dairyId: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!party) {
    return {
      ok: false,
      response: jsonError(
        role === "SELLER" ? "Seller not found" : "Buyer not found",
        404
      ),
    };
  }

  return { ok: true, data: party };
}

export async function requirePartyByIdAccess(
  session: Session,
  options: {
    partyId: number;
    role: "BUYER" | "SELLER";
  }
): Promise<
  GuardResult<{
    id: number;
    dairyId: number | null;
    firstName: string;
    lastName: string;
    role: Role;
  }>
> {
  const { partyId, role } = options;

  if (session.user.role === role && session.user.id !== partyId) {
    return { ok: false, response: jsonError("Forbidden", 403) };
  }

  if (session.user.role !== "OWNER" && session.user.role !== role) {
    return { ok: false, response: jsonError("Forbidden", 403) };
  }

  const party = await prisma.user.findFirst({
    where: {
      id: partyId,
      role,
    },
    select: {
      id: true,
      dairyId: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!party || !party.dairyId) {
    return {
      ok: false,
      response: jsonError(
        role === "SELLER" ? "Seller not found" : "Buyer not found",
        404
      ),
    };
  }

  if (session.user.role === "OWNER") {
    const dairyAccess = await requireOwnedDairy(session, party.dairyId);
    if (!dairyAccess.ok) {
      return dairyAccess;
    }
  }

  return { ok: true, data: party };
}
