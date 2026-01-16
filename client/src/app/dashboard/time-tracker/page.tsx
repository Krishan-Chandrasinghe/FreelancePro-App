"use client";

import { useEffect, useState } from "react";
import { Play, Square, Clock, Timer } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
    _id: string;
    name: string;
    client: { _id: string; name: string };
    status: string;
    totalTimeSpent?: number;
    timerStartTime?: string;
}

// Helper to format milliseconds into 1h 20m or 0m
const formatTime = (ms: number) => {
    if (!ms) return "0m";
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

// Helper for more precise display in the tracker
const formatLiveTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function TimeTrackerPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [stopTimerProject, setStopTimerProject] = useState<Project | null>(null);
    const [pendingProject, setPendingProject] = useState<Project | null>(null);
    const [showSwitchModal, setShowSwitchModal] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [, setTick] = useState(0); // Force re-render

    const router = useRouter();

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => setTick(t => t + 1), 1000); // Live timer update
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            router.push("/login");
            return;
        }
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Error fetching projects", error);
        } finally {
            setLoading(false);
        }
    };

    const startTimer = async (project: Project) => {
        // Check if any OTHER project has an active timer
        const activeProject = projects.find(p => p.timerStartTime && p._id !== project._id);

        if (activeProject) {
            setPendingProject(project);
            setShowSwitchModal(true);
            return;
        }

        await executeStartTimer(project);
    };

    const executeStartTimer = async (project: Project) => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        const now = new Date().toISOString();

        // Optimistic update
        setProjects(projects.map(p => p._id === project._id ? { ...p, timerStartTime: now } : p));

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${project._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ timerStartTime: now })
            });

            // Refetch all projects to sync UI (in case another timer was stopped)
            fetchData();
            // Dispatch event for sidebar
            window.dispatchEvent(new CustomEvent("activeTimerUpdate", { detail: true }));
        } catch (error) {
            console.error("Error starting timer", error);
            fetchData();
        }
    };

    const handleConfirmSwitch = async () => {
        if (!pendingProject) return;
        const projectToStart = pendingProject;
        setShowSwitchModal(false);
        setPendingProject(null);
        await executeStartTimer(projectToStart);
    };

    const handleCancelSwitch = () => {
        setShowSwitchModal(false);
        setPendingProject(null);
    };

    const confirmStopTimer = (project: Project) => {
        if (!project.timerStartTime) return;
        const now = new Date();
        const start = new Date(project.timerStartTime);
        const diff = now.getTime() - start.getTime();
        setElapsedTime(diff);
        setStopTimerProject(project);
    };

    const handleSaveTime = async () => {
        if (!stopTimerProject) return;
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        const newTotalTime = (stopTimerProject.totalTimeSpent || 0) + elapsedTime;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${stopTimerProject._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    totalTimeSpent: newTotalTime,
                    timerStartTime: null // Stop the timer
                })
            });

            if (res.ok) {
                const updated = await res.json();
                setProjects(projects.map(p => p._id === updated._id ? updated : p));
                setStopTimerProject(null);
                setElapsedTime(0);
                // Dispatch event for sidebar
                window.dispatchEvent(new CustomEvent("activeTimerUpdate", { detail: false }));
            }
        } catch (error) {
            console.error("Error saving time", error);
        }
    };

    const handleContinueTime = () => {
        setStopTimerProject(null);
        setElapsedTime(0);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Time Tracker</h1>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : projects.length === 0 ? (
                <div className="rounded-md border bg-white dark:bg-zinc-950 p-8 text-center text-muted-foreground">
                    <Timer className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No projects found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => {
                        let currentSessionMs = 0;
                        if (project.timerStartTime) {
                            currentSessionMs = new Date().getTime() - new Date(project.timerStartTime).getTime();
                        }

                        return (
                            <div key={project._id} className="flex items-center justify-between rounded-lg border bg-white dark:bg-zinc-950 p-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${project.timerStartTime ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-lg">{project.name}</h3>
                                        <p className="text-sm text-muted-foreground">{project.client?.name || "No Client"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total Time</p>
                                        <p className="font-mono font-medium text-lg">{formatTime(project.totalTimeSpent || 0)}</p>
                                    </div>

                                    {project.timerStartTime && (
                                        <div className="text-right">
                                            <p className="text-sm text-green-600 font-medium">Running</p>
                                            <p className="font-mono font-medium text-lg text-green-600">{formatLiveTime(currentSessionMs)}</p>
                                        </div>
                                    )}

                                    <div>
                                        {project.timerStartTime ? (
                                            <button
                                                onClick={() => confirmStopTimer(project)}
                                                className="inline-flex items-center justify-center rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-900 shadow-sm hover:bg-red-200"
                                            >
                                                <Square className="mr-2 h-4 w-4 fill-current" /> Stop
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => startTimer(project)}
                                                className="inline-flex items-center justify-center rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-900 shadow-sm hover:bg-green-200"
                                            >
                                                <Play className="mr-2 h-4 w-4 fill-current" /> Start
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Stop Timer Confirmation Modal */}
            {stopTimerProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-sm rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">Stop Timer?</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Time recorded for this session: <span className="font-mono font-medium text-black dark:text-white">{formatLiveTime(elapsedTime)}</span>
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleContinueTime}
                                className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-gray-100 dark:hover:bg-zinc-800"
                            >
                                Continue
                            </button>
                            <button
                                onClick={handleSaveTime}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Save Time
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Switch Timer Confirmation Modal */}
            {showSwitchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-sm rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">Switch Timer?</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Another project timer is currently running. Starting this one will stop and save the current session.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCancelSwitch}
                                className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-gray-100 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSwitch}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Switch Timer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
