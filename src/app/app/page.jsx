'use client'

import Sidebar from "../components/modules/Sidebar"
import NavbarApp from "../components/Navbars/Navbar"




function page() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area with Navbar */}
      <div className="flex-1">
        <NavbarApp isSidebarOpen={true} />
      </div>
    </div>
  )
}

export default page