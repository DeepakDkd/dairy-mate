import { AdminDashboardProps } from "@/types/admin-dashboard"
import { User } from "@prisma/client"

export function useGreeting(user:any): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return `Good Morning, ${user?.firstName} ${user?.lastName} 👋`
  } else if (hour < 18) {
    return `Good Afternoon, ${user?.firstName} ${user?.lastName} 👋`
  } else {
    return `Good Evening, ${user?.firstName} ${user?.lastName} 👋`
  }
}
