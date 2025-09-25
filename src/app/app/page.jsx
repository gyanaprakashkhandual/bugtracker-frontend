import { Sidebar } from "../components/modules/Sidebar";
import NavbarApp from "../components/Navbars/Navbar";



export const metadata = {
  title: "Dashboard - Integrate with code cloud",
  description: "Dashboard page for Calf",
};

function Page() {
  return (
    <div className="flex h-screen">
      <Sidebar />
     <NavbarApp/>
    </div>
  );
}

export default Page;
