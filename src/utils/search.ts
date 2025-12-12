import { Prisma } from "@prisma/client";

export function getUserSearchFilter(
  search: string
): Prisma.UserWhereInput | undefined {
  if (!search) return undefined;

  return {
    OR: [
      {
        firstName: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      {
        lastName: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      {
        email: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      {
        phone: {
          contains: search,
        },
      },
    ],
  };
}
