"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();
    setMessage(result.message);

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <h1>MoneyTrack</h1>
        <p style={{ margin: "12px 0 25px" }}>
          Login ke akun kamu
        </p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button className="btn" style={{ width: "100%" }}>
          Login
        </button>

        <p style={{ marginTop: 15 }}>{message}</p>

        <p style={{ marginTop: 15 }}>
          Belum punya akun? <Link href="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}