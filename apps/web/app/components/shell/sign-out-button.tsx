"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { clearLocalDrafts, clearOfflinePages } from "~/lib/pwa";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    clearLocalDrafts();
    await clearOfflinePages();
    window.location.href = "/logout";
  };

  return (
    <Button
      type="button"
      variant="danger"
      onClick={() => {
        void signOut();
      }}
      disabled={busy}
      icon={<LogOut size={15} />}
    >
      {busy ? "Signing out…" : "Sign out"}
    </Button>
  );
}
