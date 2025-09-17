
"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton() {
  const [isLoading] = useState(false);

  const handleLogout = async () => {
   
  };

  return (
    
    <div 
      onClick={handleLogout} 
      className="w-full flex items-center cursor-pointer"
      aria-disabled={isLoading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Saindo..." : "Sair"}
    </div>
  );
}