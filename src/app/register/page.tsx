"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const result = await res.json();
    setMessage(result.message);

    if (res.ok) {
      router.push("/login");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1>MoneyTrack</h1>
        <p style={{ margin: "12px 0 25px" }}>
          Buat akun baru
        </p>

        <label>Nama</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

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
          minLength={8}
          required
        />

        <button className="btn" style={{ width: "100%" }}>
          Register
        </button>

        <p style={{ marginTop: 15 }}>{message}</p>

        <p style={{ marginTop: 15 }}>
          Sudah punya akun? <Link href="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}