import { Role } from "@prisma/client";

export interface AdminDashboardProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    role: Role;
    phone: string;
    dairyId?: number | null;
  };
}
