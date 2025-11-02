import "next-auth";
import { Role, CustomerType } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    name: string;
    mobile: string;
    balanceAmount: number;
    customerType: CustomerType;
  }

  interface Session {
    user: User & {
      id: string;
      role: Role;
      name: string;
      mobile: string;
      balanceAmount: number;
      customerType: CustomerType;
    };
  }
}