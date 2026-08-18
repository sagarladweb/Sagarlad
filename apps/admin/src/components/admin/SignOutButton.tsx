"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut({ redirect: false });
        router.push("/admin");
        router.refresh();
      }}
      aria-label="Sign out"
      className="p-2 rounded-lg hover:bg-muted transition-colors"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
