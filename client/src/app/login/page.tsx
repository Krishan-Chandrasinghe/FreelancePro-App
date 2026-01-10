"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://127.0.0.1:5001/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Token is handled via HttpOnly cookie largely, but if we return it, store it.
                // My generateToken utils sends cookie, but optionally I can store user info in context.
                // For now, redirect to dashboard.
                localStorage.setItem("userInfo", JSON.stringify(data));
                router.push("/dashboard");
            } else {
                setError(data.message || "Something went wrong");
            }
        } catch (err) {
            setError("Failed to connect to server");
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <Link href="/" className="mb-8 flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">FreelancePro</span>
            </Link>

            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-white p-6 shadow-md dark:bg-black dark:border-zinc-800">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400">Enter your credentials to access your account</p>
                </div>

                {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        Sign In
                    </button>
                </form>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
