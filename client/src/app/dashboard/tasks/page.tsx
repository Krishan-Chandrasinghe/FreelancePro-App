"use client";

import { useEffect, useState } from "react";
import { Plus, CheckSquare, Calendar, X, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Task {
    _id: string;
    title: string;
    project: { _id: string; name: string };
    status: string;
    dueDate: string;
}

interface Project {
    _id: string;
    name: string;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<string>("All");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        project: "",
        description: "",
        status: "To Do",
        dueDate: ""
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
            const [resTasks, resProjects] = await Promise.all([
                fetch("http://127.0.0.1:5001/api/tasks", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("http://127.0.0.1:5001/api/projects", { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (resTasks.ok && resProjects.ok) {
                const tasksData = await resTasks.json();
                const projectsData = await resProjects.json();
                setTasks(tasksData);
                setProjects(projectsData);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const url = editingTask
                ? `http://127.0.0.1:5001/api/tasks/${editingTask._id}`
                : "http://127.0.0.1:5001/api/tasks";

            const method = editingTask ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const savedTask = await res.json();
                // Manually populate project name
                const projectName = projects.find(p => p._id === savedTask.project)?.name || "Unknown";
                const taskWithProject = { ...savedTask, project: { _id: savedTask.project, name: projectName } };

                if (editingTask) {
                    setTasks(tasks.map(t => t._id === savedTask._id ? taskWithProject : t));
                } else {
                    setTasks([...tasks, taskWithProject]);
                }
                closeModal();
            }
        } catch (error) {
            console.error("Error saving task", error);
        }
    };

    const handleDeleteTask = (id: string) => {
        setDeleteTaskId(id);
    };

    const confirmDelete = async () => {
        if (!deleteTaskId) return;

        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`http://127.0.0.1:5001/api/tasks/${deleteTaskId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setTasks(tasks.filter(t => t._id !== deleteTaskId));
                setDeleteTaskId(null);
            }
        } catch (error) {
            console.error("Error deleting task", error);
        }
    };

    const cancelDelete = () => {
        setDeleteTaskId(null);
    };

    const openAddModal = () => {
        setEditingTask(null);
        setFormData({ title: "", project: "", description: "", status: "To Do", dueDate: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            project: task.project._id,
            description: (task as any).description || "",
            status: task.status,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setFormData({ title: "", project: "", description: "", status: "To Do", dueDate: "" });
    };

    const filteredTasks = selectedProject === "All"
        ? tasks
        : tasks.filter(task => task.project._id === selectedProject);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                    >
                        <option value="All">All Projects</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : filteredTasks.length === 0 ? (
                <div className="rounded-md border bg-white dark:bg-zinc-950 p-8 text-center text-muted-foreground">
                    <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No tasks found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map((task) => (
                        <div key={task._id} className="flex items-center justify-between rounded-lg border bg-white dark:bg-zinc-950 p-4 shadow-sm group">
                            <div className="flex items-center gap-4">
                                <div className={`h-4 w-4 rounded-full border border-primary ${task.status === 'Done' ? 'bg-primary' : ''}`} />
                                <div>
                                    <h3 className={`font-medium ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h3>
                                    <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${task.status === 'Done' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {task.status}
                                </span>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(task)}
                                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task._id)}
                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingTask ? "Edit Task" : "Add New Task"}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTask} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Task Title</label>
                                <input
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Project</label>
                                <select
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.project}
                                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
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
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
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
                                    {editingTask ? "Update Task" : "Save Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTaskId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-sm rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">Delete Task?</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Are you sure you want to delete this task? This action cannot be undone.
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
