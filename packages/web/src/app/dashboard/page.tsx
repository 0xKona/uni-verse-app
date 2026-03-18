"use client";
import { useEffect, useState } from "react";
import { getUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    getUser()
      .then((user) => setUsername(user.username))
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {username && <p>Logged in as: {username}</p>}
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
}
