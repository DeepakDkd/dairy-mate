
import AdminDashboard from "@/components/dashboard/admin";
import { getServerActionUser } from "../../fetchers/user/action";



export default async function DashboardPage() {
  const user = await getServerActionUser();
  if(!user){
    return <div className="container mx-auto ">User not found</div>
  }
  return (
    <div className="container mx-auto ">
      <AdminDashboard user={user} />
    </div>
  );
}
