"use client";

import { useEffect, useState } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

type User = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  picture: string | null;
};

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load authenticated user:", error);
      }
    }

    loadUser();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-800" />

        <div className="hidden sm:block">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
          <div className="mt-2 h-2 w-32 animate-pulse rounded bg-slate-800" />
        </div>
      </div>
    );
  }

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "SOC Analyst";

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "SA";

    return (
        <div className="flex items-center gap-3">
            {user.picture ? (
            <img
                src={user.picture}
                alt={fullName}
                className="h-9 w-9 rounded-full border border-slate-700 object-cover"
            />
            ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-slate-950">
                {initials}
            </div>
            )}

            <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-200">
                {fullName}
            </p>

            <p className="text-xs text-slate-500">
                {user.email}
            </p>
            </div>

            <LogoutLink>
            <span className="ml-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400">
                Logout
            </span>
            </LogoutLink>
        </div>
    );
}