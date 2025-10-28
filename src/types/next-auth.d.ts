import "next-auth";
import { Role, CustomerType } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    customerType: CustomerType;
    balanceAmount: number;
  }

  interface Session {
    user: User & {
      id: string;
      role: Role;
      customerType: CustomerType;
    };
  }
}