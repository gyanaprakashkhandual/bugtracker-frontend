import { Sidebar } from "../components/modules/Sidebar";
import UserManagement from "../components/user/UserManagerment";


export const metadata = {
  title: "Dashboard - Integrate with code cloud",
  description: "Dashboard page for Calf",
};

function Page() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <UserManagement/>
    </div>
  );
}

export default Page;
