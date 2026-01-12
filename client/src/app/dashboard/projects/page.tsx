"use client";

import { useEffect, useState } from "react";
import { Plus, FolderKanban, Calendar, DollarSign, X, Pencil, Trash2, Minus, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
    _id: string;
    name: string;
    client: { _id: string; name: string };
    status: string;
    dueDate: string;
    budget: number;
    description?: string;
    startDate?: string;
    progress: number;
    totalTimeSpent?: number;
    timerStartTime?: string; // Date string from backend
}

interface Client {
    _id: string;
    name: string;
}

// Helper for style mapping
const getProjectStyle = (status: string) => {
    switch (status) {
        case "In Progress":
            return {
                card: "bg-blue-50/50 border-blue-200 shadow-blue-100 dark:bg-blue-950/20 dark:border-blue-800 dark:shadow-none hover:shadow-blue-200",
                badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
            };
        case "Pending":
            return {
                card: "bg-yellow-50/50 border-yellow-200 shadow-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-800 dark:shadow-none hover:shadow-yellow-200",
                badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
            };
        case "Completed":
            return {
                card: "bg-green-50/50 border-green-200 shadow-green-100 dark:bg-green-950/20 dark:border-green-800 dark:shadow-none hover:shadow-green-200",
                badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
            };
        case "Paused":
            return {
                card: "bg-gray-50/50 border-gray-200 shadow-gray-100 dark:bg-gray-950/20 dark:border-gray-800 dark:shadow-none hover:shadow-gray-200",
                badge: "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300"
            };
        default: // Not Started or others
            return {
                card: "bg-white border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800",
                badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            };
    }
};

// Helper to format milliseconds into 1h 20m or 0m
const formatTime = (ms: number) => {
    if (!ms) return "0m";
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        client: "",
        description: "",
        status: "Not Started",
        startDate: "",
        dueDate: "",
        budget: ""
    });

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
            const [resProjects, resClients] = await Promise.all([
                fetch("http://127.0.0.1:5001/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("http://127.0.0.1:5001/api/clients", { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (resProjects.ok && resClients.ok) {
                const projectsData = await resProjects.json();
                const clientsData = await resClients.json();
                setProjects(projectsData);
                setClients(clientsData);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const url = editingProject
                ? `http://127.0.0.1:5001/api/projects/${editingProject._id}`
                : "http://127.0.0.1:5001/api/projects";

            const method = editingProject ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const savedProject = await res.json();
                // Helper to format the project with client object for state
                const clientName = clients.find(c => c._id === savedProject.client)?.name || "Unknown";
                const projectWithClient = {
                    ...savedProject,
                    client: { _id: savedProject.client, name: clientName }
                };

                if (editingProject) {
                    setProjects(projects.map(p => p._id === savedProject._id ? projectWithClient : p));
                } else {
                    setProjects([...projects, projectWithClient]);
                }
                closeModal();
            }
        } catch (error) {
            console.error("Error saving project", error);
        }
    };

    const handleDeleteProject = (id: string) => {
        setDeleteProjectId(id);
    };

    const confirmDelete = async () => {
        if (!deleteProjectId) return;

        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`http://127.0.0.1:5001/api/projects/${deleteProjectId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setProjects(projects.filter(p => p._id !== deleteProjectId));
                setDeleteProjectId(null);
            }
        } catch (error) {
            console.error("Error deleting project", error);
        }
    };

    const cancelDelete = () => {
        setDeleteProjectId(null);
    };

    const handleProgressUpdate = async (id: string, newProgress: number) => {
        if (newProgress < 0 || newProgress > 100) return;

        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        // Optimistic update
        setProjects(projects.map(p => p._id === id ? { ...p, progress: newProgress } : p));

        try {
            await fetch(`http://127.0.0.1:5001/api/projects/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ progress: newProgress })
            });
        } catch (error) {
            console.error("Error updating progress", error);
            fetchData(); // Revert on error
        }
    };

    const openAddModal = () => {
        setEditingProject(null);
        setFormData({ name: "", client: "", description: "", status: "Not Started", startDate: "", dueDate: "", budget: "" });
        setIsAddOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            client: project.client._id,
            description: project.description || "",
            status: project.status,
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
            dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : "",
            budget: project.budget.toString()
        });
        setIsAddOpen(true);
    };

    const closeModal = () => {
        setIsAddOpen(false);
        setEditingProject(null);
        setFormData({ name: "", client: "", description: "", status: "Not Started", startDate: "", dueDate: "", budget: "" });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Project
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : projects.length === 0 ? (
                <div className="rounded-md border bg-white dark:bg-zinc-950 p-8 text-center text-muted-foreground">
                    <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No projects found. Create one to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => {
                        const styles = getProjectStyle(project.status);

                        // Calculate display time
                        let totalMs = project.totalTimeSpent || 0;
                        if (project.timerStartTime) {
                            totalMs += (new Date().getTime() - new Date(project.timerStartTime).getTime());
                        }

                        return (
                            <div key={project._id} className={`rounded-xl border p-6 shadow-sm relative group transition-all duration-200 ${styles.card}`}>
                                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openEditModal(project); }}
                                        className="p-1.5 bg-white/50 hover:bg-white rounded-md text-gray-700 shadow-sm ring-1 ring-gray-200"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project._id); }}
                                        className="p-1.5 bg-white/50 hover:bg-red-50 rounded-md text-red-500 hover:text-red-600 shadow-sm ring-1 ring-red-100"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div className="flex flex-col h-full">
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-lg leading-none mb-1">{project.name}</h3>
                                        <p className="text-sm text-muted-foreground">{project.client?.name}</p>
                                    </div>

                                    <div className="space-y-3 text-sm flex-1">
                                        {project.description && (
                                            <p className="text-muted-foreground line-clamp-2 text-xs mb-3">{project.description}</p>
                                        )}
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                            Due: {new Date(project.dueDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <DollarSign className="mr-2 h-4 w-4 opacity-70" />
                                            Budget: ${project.budget.toLocaleString()}
                                        </div>
                                        {/* Time Tracker UI - Display Only */}
                                        <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center text-muted-foreground font-mono text-xs">
                                                <Clock className={`mr-2 h-4 w-4 ${project.timerStartTime ? 'text-green-500 animate-pulse' : 'opacity-70'}`} />
                                                {formatTime(totalMs)} {project.timerStartTime && <span className="ml-2 text-green-600 text-[10px]">(Running)</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between items-end">
                                        <div className="w-full mr-4">
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>Progress</span>
                                                <span>{project.progress || 0}%</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleProgressUpdate(project._id, (project.progress || 0) - 10); }}
                                                    className="h-5 w-5 rounded-full border flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"
                                                    disabled={(project.progress || 0) <= 0}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-300 rounded-full"
                                                        style={{ width: `${project.progress || 0}%` }}
                                                    />
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleProgressUpdate(project._id, (project.progress || 0) + 10); }}
                                                    className="h-5 w-5 rounded-full border flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"
                                                    disabled={(project.progress || 0) >= 100}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm ${styles.badge} whitespace-nowrap`}>
                                            {project.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Project Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingProject ? "Edit Project" : "Add New Project"}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Project Name</label>
                                <input
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client</label>
                                <select
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.client}
                                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(client => (
                                        <option key={client._id} value={client._id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Not Started">Not Started</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Paused">Paused</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <input
                                        type="date"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <input
                                        type="date"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Budget</label>
                                <input
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {editingProject ? "Update Project" : "Save Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Delete Confirmation Modal */}
            {deleteProjectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-sm rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">Delete Project?</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Are you sure you want to delete this project? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-gray-100 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
