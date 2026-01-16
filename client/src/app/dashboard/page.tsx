"use client";

import { useEffect, useState } from "react";
import { DollarSign, FolderKanban, Users, AlertCircle, Loader2, ExternalLink, Timer, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const router = useRouter();

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        let interval: any;
        if (stats?.activeTimer) {
            const startTime = new Date(stats.activeTimer.timerStartTime).getTime();
            const totalPrevious = stats.activeTimer.totalTimeSpent || 0;

            interval = setInterval(() => {
                const now = new Date().getTime();
                setElapsedTime(now - startTime + totalPrevious);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [stats?.activeTimer]);

    const fetchStats = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            router.push("/login");
            return;
        }
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                // Dispatch event for sidebar
                window.dispatchEvent(new CustomEvent("activeTimerUpdate", { detail: !!data.activeTimer }));
            }
        } catch (error) {
            console.error("Error fetching stats", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStopTimer = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/stop-active`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                fetchStats();
            }
        } catch (error) {
            console.error("Error stopping timer", error);
        }
    };

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-1">Real-time performance metrics and recent activity.</p>
                </div>
                {stats.activeTimer && (
                    <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl p-4 flex items-center gap-6 shadow-sm border-l-4 border-l-rose-500">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-500 rounded-xl">
                                <Timer className="h-5 w-5 text-white animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Active Tracking</p>
                                <p className="text-sm font-bold truncate max-w-[150px]">{stats.activeTimer.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-l border-rose-200 dark:border-rose-800 pl-6 px-2">
                            <div className="font-mono text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                                {formatTime(elapsedTime)}
                            </div>
                            <button
                                onClick={handleStopTimer}
                                className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-rose-500/20"
                                title="Stop Timer"
                            >
                                <Square className="h-4 w-4 fill-current" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-6 shadow-sm border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-[220px]">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Total Clients</div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-black mt-2 whitespace-nowrap">{stats.totalClients}</div>
                    <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold whitespace-nowrap">Managed clients</p>
                </div>

                <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-6 shadow-sm border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-[220px]">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Active Projects</div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg shrink-0">
                            <FolderKanban className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-black mt-2 whitespace-nowrap">{stats.activeProjects}</div>
                    <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold whitespace-nowrap">In Progress</p>
                </div>

                <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-6 shadow-sm border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-[220px]">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Total Earning</div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg shrink-0">
                            <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-black mt-2 whitespace-nowrap tracking-tighter" title={`$${stats.totalEarning?.toLocaleString()}`}>
                        ${stats.totalEarning?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold whitespace-nowrap">Completed</p>
                </div>

                <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-6 shadow-sm border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-[220px]">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Pending</div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg shrink-0">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-black mt-2 whitespace-nowrap">{stats.pendingInvoices}</div>
                    <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold whitespace-nowrap">Awaiting pay</p>
                </div>

                <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-6 shadow-sm border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-[220px]">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Outstanding</div>
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg shrink-0">
                            <DollarSign className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-black mt-2 whitespace-nowrap tracking-tighter" title={`$${stats.unpaidAmount.toLocaleString()}`}>
                        ${stats.unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold whitespace-nowrap">Unpaid total</p>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                <div className="lg:col-span-4 rounded-2xl border bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-lg">Recent Invoices</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Your latest billings and their status.</p>
                        </div>
                        <Link href="/dashboard/invoices" className="text-xs font-bold text-primary hover:underline">View All</Link>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm min-w-[500px] md:min-w-0">
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {stats.recentInvoices.map((invoice: any) => (
                                    <tr key={invoice._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-primary">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4 font-bold">{invoice.client?.name}</td>
                                        <td className="px-6 py-4 font-black">${invoice.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${invoice.status === 'Complete' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40' :
                                                invoice.status === 'Not Paid' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/40'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {stats.recentInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No recent invoices</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-3 rounded-2xl border bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-lg">Recent Projects</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Ongoing work and upcoming deadlines.</p>
                        </div>
                        <Link href="/dashboard/projects" className="text-xs font-bold text-primary hover:underline">View All</Link>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {stats.recentProjects.map((project: any) => (
                                <div key={project._id} className="flex items-center group cursor-pointer" onClick={() => router.push(`/dashboard/projects`)}>
                                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        <FolderKanban className="h-5 w-5" />
                                    </div>
                                    <div className="ml-4 space-y-0.5">
                                        <p className="text-sm font-bold leading-none">{project.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Client: {project.client?.name}</p>
                                    </div>
                                    <div className={`ml-auto text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${project.status === 'Active' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' :
                                        'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                                        }`}>
                                        {project.status}
                                    </div>
                                </div>
                            ))}
                            {stats.recentProjects.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground">No recent projects</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
