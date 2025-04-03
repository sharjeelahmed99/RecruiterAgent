import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BellIcon, SearchIcon, MenuIcon } from "lucide-react";

type NavbarProps = {
  onSidebarToggle: () => void;
};

export default function Navbar({ onSidebarToggle }: NavbarProps) {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-600 md:hidden"
        onClick={onSidebarToggle}
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <SearchIcon className="h-5 w-5" />
              </div>
              <Input
                id="search"
                className="block w-full h-full pl-10 pr-3 py-2 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm"
                placeholder="Search interviews or questions"
                type="search"
              />
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <Button
            variant="ghost"
            size="icon"
            className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
          </Button>

          <div className="ml-3 relative">
            <div>
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User profile"
                />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
