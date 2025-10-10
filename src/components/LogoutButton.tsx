"use client";

import { logout } from "@/app/actions";
import { LogOut } from "lucide-react";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      onClick={() => logout()}
      className="flex items-center w-full text-left"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {children}
    </button>
  );
}