"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <div className="navbar">
      <h3>MoneyTrack Dashboard</h3>
      <button className="btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}