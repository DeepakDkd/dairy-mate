import "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: number
    role: Role
    firstName: string
    lastName: string
    phone: string
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
  }
}
