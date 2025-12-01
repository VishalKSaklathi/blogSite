import * as React from "react"
import {
  GalleryVerticalEnd,
  Home,
  Folder,
  Clock,
  Layers,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";

// Category Service
const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:3000';

class CategoryService {
  constructor() {
    this.baseURL = `${API_BASE}/api/categories`;
  }

  async makeRequest(url, options = {}) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async getAllCategories() {
    return await this.makeRequest(this.baseURL);
  }
}

const categoryService = new CategoryService();

export function AppSidebar({ ...props }) {
  const [categories, setCategories] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchCategories();

    // Listen for custom refresh event from BlogForm
    const handleRefresh = () => {
      console.log("📡 Refresh event received - reloading categories");
      fetchCategories();
    };

    window.addEventListener('refreshCategories', handleRefresh);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('refreshCategories', handleRefresh);
    };
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoryService.getAllCategories();
      const categoriesData = response.data || response;
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Build navigation data dynamically
  const navMain = [
    {
      title: "Home",
      url: "/blogs",
      icon: Home,
      items: [],
    },
    {
      title: "Categories",
      url: "#",
      icon: Layers,
      items: categories.map((category) => ({
        title: category.name,
        url: `/blogs/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`, // URL-friendly name
        id: category.id,
        state: { categoryId: category.id, categoryName: category.name } // Pass as state
      })),
    },
  ];

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">BlogSite</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium flex items-center gap-2">
                    <item.icon className="size-4" />
                    {item.title}
                  </a>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {/* Show loading state for categories */}
                    {item.title === "Categories" && isLoading ? (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ) : item.items.length === 0 && item.title === "Categories" ? (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          <span className="text-sm text-muted-foreground">No categories</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ) : (
                      item.items.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton asChild isActive={sub.isActive}>
                            <Link
                              to={sub.url}
                              state={sub.state}
                              className="flex items-center gap-2"
                            >
                              {sub.icon && <sub.icon className="size-4" />}
                              {sub.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))
                    )}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}