"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, Clock, FileText, Receipt, CheckSquare, LogOut, Menu, X, Rocket, User } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const userInfo = localStorage.getItem("userInfo");
            if (!userInfo) {
                router.push("/login");
            } else {
                const parsed = JSON.parse(userInfo);
                setUser(parsed);

                // Also check for active timer to keep sidebar updated
                try {
                    const res = await fetch("http://127.0.0.1:5001/api/dashboard/stats", {
                        headers: {
                            Authorization: `Bearer ${parsed.token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setTimerActive(!!data.activeTimer);
                    }
                } catch (e) {
                    console.error("Error checking timer in layout", e);
                }
            }
        };

        const handleTimerUpdate = (e: any) => {
            setTimerActive(e.detail);
        };

        checkUser();

        window.addEventListener("storage", checkUser);
        window.addEventListener("activeTimerUpdate", handleTimerUpdate);

        const handleUnload = () => {
            const storedInfo = localStorage.getItem("userInfo");
            if (storedInfo) {
                const { token } = JSON.parse(storedInfo);
                fetch("http://127.0.0.1:5001/api/projects/stop-active", {
                    method: "POST",
                    keepalive: true,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => {
            window.removeEventListener("storage", checkUser);
            window.removeEventListener("activeTimerUpdate", handleTimerUpdate);
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [router]);

    const handleLogout = async () => {
        const storedInfo = localStorage.getItem("userInfo");
        if (storedInfo) {
            const { token } = JSON.parse(storedInfo);
            try {
                await fetch("http://127.0.0.1:5001/api/projects/stop-active", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (e) {
                console.error("Error stopping timer on logout", e);
            }
        }
        localStorage.removeItem("userInfo");
        router.push("/login");
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Clients", href: "/dashboard/clients", icon: Users },
        { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
        { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
        { name: "Time Tracker", href: "/dashboard/time-tracker", icon: Clock },
        { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
        { name: "Expenses", href: "/dashboard/expenses", icon: Receipt },
        { name: "Trial Tracking", href: "/dashboard/trials", icon: Rocket },
    ];

    if (!user) return null;

    const firstName = user.name?.split(' ')[0] || 'User';

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
            {/* Sidebar - Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-black border-r transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-16 items-center px-6 border-b">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                    <span className="ml-2 text-xl font-bold text-primary">FreelancePro</span>
                    <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isTimeTrackerActive = item.name === "Time Tracker" && timerActive;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? "bg-primary/10 text-primary"
                                    : isTimeTrackerActive
                                        ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${isTimeTrackerActive ? "animate-pulse" : ""}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t">
                    <Link href="/dashboard/profile" className="flex items-center mb-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                user.name?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">Hi, {firstName}</p>
                            <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest font-black">View Profile</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-3 py-2 text-sm font-medium text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center border-b bg-white dark:bg-black px-4 shadow-sm md:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-4 text-lg font-bold">Dashboard</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
