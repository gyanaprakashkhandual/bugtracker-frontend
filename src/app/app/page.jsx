'use client'
import AppNavbar from "../components/Navbars/App"
import ProjectSidebar from "../components/Sidebars/Project"


function Page() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0">
        <ProjectSidebar />
      </div>
      <div className="flex-1 ">
        <AppNavbar />
      </div>
    </div>
  )
}

export default Page;
