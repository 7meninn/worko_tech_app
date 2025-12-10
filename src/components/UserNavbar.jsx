import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const UserNavbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Get User Data
  const user = JSON.parse(localStorage.getItem("worko_user"));

  const handleLogout = () => {
    localStorage.removeItem("worko_user");
    navigate("/");
  };

  const getInitials = (name) => {
    return name ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "U";
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/home" className="text-2xl font-bold text-indigo-600 tracking-tight">
          Worko.
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/bookings" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
            Bookings
          </Link>
          <Link to="/wplus" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
            WPlus
          </Link>
          
          <div className="h-6 w-[1px] bg-gray-200"></div>

          <div className="flex items-center gap-3">
             <Avatar className="h-9 w-9 bg-indigo-50 border border-indigo-100">
               <AvatarFallback className="text-indigo-600 text-xs font-bold">
                 {getInitials(user?.name)}
               </AvatarFallback>
             </Avatar>
             <span className="text-sm font-medium text-gray-700">{user?.name}</span>
             <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={handleLogout}>
               Logout
             </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4">
          <Link to="/bookings" className="text-sm font-medium text-gray-700 py-2">Bookings</Link>
          <Link to="/wplus" className="text-sm font-medium text-gray-700 py-2">WPlus</Link>
          <div className="border-t border-gray-100 my-1"></div>
          <div className="flex items-center gap-3 py-2">
             <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {getInitials(user?.name)}
             </div>
             <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>Logout</Button>
        </div>
      )}
    </nav>
  );
};

export default UserNavbar;