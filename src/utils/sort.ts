import { Prisma } from "@prisma/client";

export function getUserSort(
  sort?: string
): Prisma.UserOrderByWithRelationInput {
  switch (sort) {
    case "name_asc":
      return { firstName: Prisma.SortOrder.asc };

    case "name_desc":
      return { firstName: Prisma.SortOrder.desc };

    case "createdAt_asc":
      return { createdAt: Prisma.SortOrder.asc };

    case "createdAt_desc":
    default:
      return { createdAt: Prisma.SortOrder.desc };
  }
}
