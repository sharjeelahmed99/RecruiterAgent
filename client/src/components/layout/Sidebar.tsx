import { Link, useLocation } from "wouter";
import { 
  HomeIcon, 
  HelpCircleIcon, 
  ClipboardListIcon, 
  BarChartIcon,
  SettingsIcon,
  XIcon,
  FileEditIcon,
  UsersIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type SidebarProps = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: SidebarProps = {}) {
  const [location] = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: HomeIcon,
    },
    {
      name: "Create Profile",
      path: "/start-interview",
      icon: HelpCircleIcon,
    },
    {
      name: "Custom Questions",
      path: "/custom-questions",
      icon: FileEditIcon,
    },
    {
      name: "Interviews",
      path: "/interviews",
      icon: ClipboardListIcon,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChartIcon,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="flex flex-col w-64">
      <div className="flex flex-col h-0 flex-1">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-indigo-700">
          {onClose && (
            <button 
              onClick={onClose}
              className="mr-2 text-indigo-200 hover:text-white"
            >
              <XIcon className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-white text-xl font-bold">Interview Assistant</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 bg-indigo-800 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md 
                    ${isActive(item.path) 
                      ? "bg-indigo-900 text-white" 
                      : "text-indigo-100 hover:bg-indigo-600"
                    }
                  `}
                >
                  <Icon 
                    className={`
                      mr-3 h-6 w-6 
                      ${isActive(item.path) ? "text-indigo-300" : "text-indigo-300"}
                    `} 
                  />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Admin-only links */}
            {isAdmin && (
              <Link 
                href="/manage-users"
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md 
                  ${isActive("/manage-users") 
                    ? "bg-indigo-900 text-white" 
                    : "text-indigo-100 hover:bg-indigo-600"
                  }
                `}
              >
                <UsersIcon 
                  className={`
                    mr-3 h-6 w-6 
                    ${isActive("/manage-users") ? "text-indigo-300" : "text-indigo-300"}
                  `} 
                />
                Manage Users
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
