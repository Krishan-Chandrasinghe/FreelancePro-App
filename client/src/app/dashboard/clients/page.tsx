"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreHorizontal, Phone, Mail, Building, X, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Client {
    _id: string;
    name: string;
    email: string;
    companyName: string;
    phone: string;
    status: string;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        companyName: "",
        phone: "",
        address: ""
    });
    const router = useRouter();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            router.push("/login");
            return;
        }
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            } else {
                if (res.status === 401) {
                    localStorage.removeItem("userInfo");
                    router.push("/login");
                }
            }
        } catch (error) {
            console.error("Error fetching clients", error);
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
            const url = editingClient
                ? `${process.env.NEXT_PUBLIC_API_URL}/clients/${editingClient._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/clients`;

            const method = editingClient ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedClient = await res.json();
                if (editingClient) {
                    setClients(clients.map(c => c._id === updatedClient._id ? updatedClient : c));
                } else {
                    setClients([...clients, updatedClient]);
                }
                closeModal();
            }
        } catch (error) {
            console.error("Error saving client", error);
        }
    };

    const handleDeleteClient = (id: string) => {
        setDeleteClientId(id);
    };

    const confirmDelete = async () => {
        if (!deleteClientId) return;

        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${deleteClientId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setClients(clients.filter(c => c._id !== deleteClientId));
                setDeleteClientId(null);
            }
        } catch (error) {
            console.error("Error deleting client", error);
        }
    };

    const cancelDelete = () => {
        setDeleteClientId(null);
    };

    const openAddModal = () => {
        setEditingClient(null);
        setFormData({ name: "", email: "", companyName: "", phone: "", address: "" });
        setIsAddOpen(true);
    };

    const openEditModal = (client: any) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            email: client.email,
            companyName: client.companyName || "",
            phone: client.phone || "",
            address: client.address || ""
        });
        setIsAddOpen(true);
    };

    const closeModal = () => {
        setIsAddOpen(false);
        setEditingClient(null);
        setFormData({ name: "", email: "", companyName: "", phone: "", address: "" });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : clients.length === 0 ? (
                <div className="rounded-md border bg-white dark:bg-zinc-950 p-8 text-center text-muted-foreground">
                    <p>No clients found. Add one to get started.</p>
                </div>
            ) : (
                <div className="rounded-md border bg-white dark:bg-zinc-950">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Company</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {clients.map((client) => (
                                    <tr key={client._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{client.name}</td>
                                        <td className="p-4 align-middle">{client.companyName}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</span>
                                                {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(client)}
                                                    className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClient(client._id)}
                                                    className="p-2 hover:bg-red-50 rounded-md text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Client Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingClient ? "Edit Client" : "Add New Client"}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Company Name</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.phone}
                                    placeholder="+94 70 291 0626"
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                                    {editingClient ? "Update Client" : "Save Client"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteClientId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-sm rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">Delete Client?</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Are you sure you want to delete this client? This action cannot be undone.
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
