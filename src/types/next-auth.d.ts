import "next-auth"
import { Role, StaffRole } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: number
    role: Role
    firstName: string
    lastName: string
    phone: string
    dairyId?: number | null
    staffRole?: StaffRole | null
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number
    role: Role
    firstName: string
    lastName: string
    phone: string
    dairyId?: number | null
    staffRole?: StaffRole | null
  }
}
