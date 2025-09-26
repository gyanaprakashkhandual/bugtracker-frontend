'use client'
import ProjectSidebar from "../component/Sidebars/Project"
import NavbarApp from "../components/Navbars/Navbar"

function Page() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="sticky top-0">
        <ProjectSidebar />
      </div>

      {/* Main Content Area with Navbar */}
      <div className="flex-1 ">
        <NavbarApp isSidebarOpen={true} />
      </div>
    </div>
  )
}

export default Page
