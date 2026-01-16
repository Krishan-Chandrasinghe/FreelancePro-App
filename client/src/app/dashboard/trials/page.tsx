"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    Plus,
    History,
    DollarSign,
    Loader2,
    X,
    MessageSquare,
    ChevronRight,
    Search
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
    _id: string;
    name: string;
    client: { name: string };
}

interface Trial {
    _id: string;
    project: { _id: string, name: string } | string;
    date: string;
    notes?: string;
    cost: number;
    isExtra: boolean;
}

export default function TrialsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [allTrials, setAllTrials] = useState<Trial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [notes, setNotes] = useState("");
    const [recording, setRecording] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            router.push("/login");
            return;
        }
        const { token } = JSON.parse(userInfo);

        try {
            const [resProjects, resTrials] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/trials`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (resProjects.ok && resTrials.ok) {
                setProjects(await resProjects.json());
                setAllTrials(await resTrials.json());
            }
        } catch (error) {
            console.error("Error fetching trial data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordTrial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId) return;

        setRecording(true);
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trials`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ projectId: selectedProjectId, notes })
            });

            if (res.ok) {
                await fetchData();
                closeModal();
            }
        } catch (error) {
            console.error("Error recording trial", error);
        } finally {
            setRecording(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProjectId("");
        setNotes("");
    };

    const getTrialsForProject = (projectId: string) => {
        return allTrials.filter(t =>
            (typeof t.project === 'string' ? t.project === projectId : t.project._id === projectId)
        );
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Project Trials</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Track free and paid trials for your client projects.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-5 w-5" />
                    Record New Trial
                </button>
            </div>

            {/* Trial Info Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-2 bg-amber-500 rounded-lg shrink-0">
                    <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Trial Policy</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Each project includes <span className="font-bold">3 free trials</span>. Extra trials are charged at <span className="font-bold">$10 per session</span>.</p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Projects List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredProjects.map(project => {
                            const trials = getTrialsForProject(project._id);
                            const freeUsed = Math.min(trials.length, 3);
                            const paidUsed = Math.max(0, trials.length - 3);

                            return (
                                <div key={project._id} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{project.name}</h3>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{project.client?.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-tighter">Free Trials</span>
                                            <span className="font-black text-emerald-600">{freeUsed}/3 Used</span>
                                        </div>
                                        <div className="h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden flex">
                                            {[1, 2, 3].map(i => (
                                                <div
                                                    key={i}
                                                    className={`flex-1 border-r border-white dark:border-zinc-950 last:border-r-0 ${i <= freeUsed ? 'bg-emerald-500' : 'bg-transparent'}`}
                                                />
                                            ))}
                                        </div>
                                        {paidUsed > 0 && (
                                            <div className="flex justify-between items-center text-[10px] pt-1">
                                                <span className="text-zinc-500 font-bold uppercase">Paid Extra Trials</span>
                                                <span className="font-black text-rose-600">+{paidUsed} (${paidUsed * 10})</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                                        <div className="flex -space-x-2">
                                            {trials.slice(0, 3).map((_, i) => (
                                                <div key={i} className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-white dark:border-zinc-950 shadow-sm">
                                                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                </div>
                                            ))}
                                            {trials.length > 3 && (
                                                <div className="h-6 w-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center border border-white dark:border-zinc-950 shadow-sm">
                                                    <span className="text-[10px] font-black text-rose-600">+{trials.length - 3}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedProjectId(project._id);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                                        >
                                            Record
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* History Sidebar */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <History className="h-4 w-4 text-zinc-500" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500">Recent Trials</h2>
                    </div>
                    <div className="space-y-3">
                        {allTrials.slice(0, 8).map(trial => (
                            <div key={trial._id} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold truncate text-zinc-900 dark:text-zinc-100">
                                            {typeof trial.project === 'object' ? trial.project.name : 'Unknown Project'}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">{new Date(trial.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-black ${trial.isExtra ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {trial.isExtra ? `-$${trial.cost}` : 'FREE'}
                                    </div>
                                </div>
                                {trial.notes && (
                                    <div className="mt-2 flex gap-2">
                                        <MessageSquare className="h-3 w-3 text-zinc-300 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-zinc-500 italic line-clamp-2">{trial.notes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {allTrials.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                                <History className="h-8 w-8 mx-auto text-zinc-200 mb-2" />
                                <p className="text-xs text-zinc-400">No trial history</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Trial Recording Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-black">Record Project Trial</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRecordTrial} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select Project</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                >
                                    <option value="">Choose a project...</option>
                                    {projects.map(p => {
                                        const trials = getTrialsForProject(p._id);
                                        const cost = trials.length >= 3 ? "$10" : "Free";
                                        return (
                                            <option key={p._id} value={p._id}>
                                                {p.name} ({cost} trial)
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Trial Notes</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]"
                                    placeholder="What was tested in this trial session?"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {selectedProjectId && (
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl flex items-center justify-between border border-zinc-100 dark:border-zinc-900">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${getTrialsForProject(selectedProjectId).length >= 3 ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                                            <DollarSign className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Session Cost</span>
                                    </div>
                                    <span className={`text-sm font-black ${getTrialsForProject(selectedProjectId).length >= 3 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {getTrialsForProject(selectedProjectId).length >= 3 ? '$10.00' : 'FREE'}
                                    </span>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={recording || !selectedProjectId}
                                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    {recording ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Record Trial"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
