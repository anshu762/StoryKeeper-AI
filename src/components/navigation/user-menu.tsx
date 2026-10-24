"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield, User as UserIcon, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="h-10 w-24 rounded-xl bg-paper-2 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm px-2.5 sm:px-3 h-8 sm:h-9">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="default" size="sm" className="hidden sm:inline-flex text-xs sm:text-sm px-3 h-9 rounded-xl shadow-xs">
          <Link href="/register">Join Archive</Link>
        </Button>
      </div>
    );
  }

  const user = session.user;
  const role = (user as unknown as { role?: string }).role || "CONTRIBUTOR";
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2.5 rounded-full p-1 pl-2 pr-3 bg-white/80 border border-line hover:bg-paper-2 transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta"
          aria-label="User account menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-white font-serif text-sm font-semibold">
            {initials}
          </div>
          <span className="text-xs font-medium text-ink max-w-[120px] truncate hidden sm:inline-block">
            {user.name || user.email}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-ink truncate">
              {user.name}
            </p>
            <p className="text-xs leading-none text-muted truncate">
              {user.email}
            </p>
            <span className="mt-1 inline-block text-[10px] font-semibold tracking-wider text-terracotta uppercase">
              {role}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <BookOpen className="h-4 w-4 text-terracotta" />
            <span>My Stories</span>
          </Link>
        </DropdownMenuItem>

        {role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4 text-moss" />
              <span>Admin Console</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
            <UserIcon className="h-4 w-4 text-muted" />
            <span>Account & Privacy</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
