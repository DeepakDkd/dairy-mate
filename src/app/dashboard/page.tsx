
import AdminDashboard from "@/components/dashboard/admin";
import { getServerActionUser } from "../fetchers/user/action";

export default function DashboardPage() {
  const user = getServerActionUser();
  console.log("User in DashboardPage:", user);
  return (
    <div className="container mx-auto ">
      <AdminDashboard />
    </div>
  );
}
