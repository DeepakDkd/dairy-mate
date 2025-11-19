import { Role } from "@prisma/client";

export interface AdminDashboardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
    phone: string;
    dairyId?: number | null;
  };
}
