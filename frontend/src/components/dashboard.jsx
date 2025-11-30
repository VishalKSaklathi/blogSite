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
                <header className='bg-background sticky top-0 flex h-16 shrink-0 items-center gap-1 border-b px-4 w-full justify-between z-10'>
                    <SidebarTrigger className="-ml-2" />
                    <h2 className="text-lg font-medium bg-primary/25 px-6 py-2 rounded-full">Blogsite</h2>
                    <Link to="/dashboard/create-blog">
                        <div
                            className="flex gap-2 px-6 py-2 rounded-full
                            hover:bg-primary/25 
                            transition-all duration-200 ease-in-out cursor-pointer"
                        >
                            <SquarePen className="h-6 w-6" />
                            <span className="max-w-6xl text-lg">Create Your Blog</span>
                        </div>

                    </Link>
                </header>
                <div className="flex-1 p-4 space-y-8">
                    <DashboardContent />
                </div>
            </SidebarInset>
        </SidebarProvider >
    )
}

export default Dashboard