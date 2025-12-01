import React from 'react'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from './ui/sidebar'
import { Link } from 'react-router-dom'
import { SquarePen } from 'lucide-react'
import DashboardContent from './dashboardContent'

function Dashboard() {
    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "19rem",
            }}
        >
            <AppSidebar />
            <SidebarInset>
                {/* Mobile Responsive Header */}
                <header className='bg-background sticky top-0 flex h-14 sm:h-16 shrink-0 items-center gap-1 sm:gap-2 border-b px-2 sm:px-4 w-full justify-between shadow-sm z-10'>
                    <SidebarTrigger className="-ml-1 sm:-ml-2" />

                    {/* Logo/Title - Responsive sizing */}
                    <h2 className="text-sm sm:text-base md:text-lg font-medium bg-primary/25 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full">
                        Blogsite
                    </h2>

                    {/* Create Blog Button - Responsive */}
                    <Link to="/create-blog">
                        {/* Desktop version - text + icon */}
                        <div className="hidden sm:flex gap-2 px-3 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-primary/25 transition-all duration-200 ease-in-out cursor-pointer">
                            <SquarePen className="h-5 w-5 md:h-6 md:w-6" />
                            <span className="text-sm md:text-lg">Create Your Blog</span>
                        </div>

                        {/* Mobile version - icon only */}
                        <div className="flex sm:hidden gap-2 px-2.5 py-1.5 rounded-full hover:bg-primary/25 transition-all duration-200 ease-in-out cursor-pointer">
                            <SquarePen className="h-5 w-5" />
                        </div>
                    </Link>
                </header>

                {/* Content Area - Responsive padding */}
                <div className="flex-1">
                    <DashboardContent />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default Dashboard