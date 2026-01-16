"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
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
                    <h1 className="text-2xl font-bold">Create an Account</h1>
                    <p className="text-gray-500 dark:text-gray-400">Join FreelancePro today</p>
                </div>

                {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none">Name</label>
                        <input
                            id="name"
                            type="text"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
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
                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        Register
                    </button>
                </form>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
