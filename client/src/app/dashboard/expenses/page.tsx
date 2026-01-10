"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Filter,
    DollarSign,
    Calendar,
    Tag,
    MoreVertical,
    Pencil,
    Trash2,
    Loader2,
    ArrowUpRight,
    TrendingUp,
    Receipt,
    X
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Expense {
    _id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    description?: string;
    receipt?: string;
}

const CATEGORIES = [
    "Software & Tools",
    "Office Supplies",
    "Travel",
    "Marketing",
    "Entertainment",
    "Miscellaneous",
    "Hardware",
    "Subscriptions"
];

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        description: ""
    });

    const router = useRouter();

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            router.push("/login");
            return;
        }
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch("http://127.0.0.1:5001/api/expenses", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error("Error fetching expenses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        const method = editingExpense ? "PUT" : "POST";
        const url = editingExpense
            ? `http://127.0.0.1:5001/api/expenses/${editingExpense._id}`
            : "http://127.0.0.1:5001/api/expenses";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });

            if (res.ok) {
                fetchExpenses();
                closeModal();
            }
        } catch (error) {
            console.error("Error saving expense", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;

        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`http://127.0.0.1:5001/api/expenses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setExpenses(expenses.filter(e => e._id !== id));
            }
        } catch (error) {
            console.error("Error deleting expense", error);
        }
    };

    const openModal = (expense?: Expense) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                title: expense.title,
                amount: expense.amount.toString(),
                category: expense.category,
                date: new Date(expense.date).toISOString().split('T')[0],
                description: expense.description || ""
            });
        } else {
            setEditingExpense(null);
            setFormData({
                title: "",
                amount: "",
                category: CATEGORIES[0],
                date: new Date().toISOString().split('T')[0],
                description: ""
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const filteredExpenses = expenses.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const topCategory = filteredExpenses.length > 0
        ? Object.entries(filteredExpenses.reduce((acc: any, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {})).sort((a: any, b: any) => b[1] - a[1])[0][0]
        : "N/A";

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
                    <h1 className="text-3xl font-black tracking-tight">Financial Expenses</h1>
                    <p className="text-muted-foreground mt-1">Track and manage your business spending.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-5 w-5" />
                    Add Expense
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-6 shadow-sm border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Spending</span>
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-black mt-2">${totalAmount.toLocaleString()}</div>
                    <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold">Filtered total</p>
                </div>

                <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-6 shadow-sm border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Top Category</span>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-xl font-black mt-2 truncate">{topCategory}</div>
                    <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold">Most spent in</p>
                </div>

                <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-6 shadow-sm border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Expense Count</span>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-black mt-2">{filteredExpenses.length}</div>
                    <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold">Recorded items</p>
                </div>
            </div>

            {/* Filters and List */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-zinc-400" />
                        <select
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm px-4 py-2 focus:outline-none"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredExpenses.map((expense) => (
                                <tr key={expense._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{expense.title}</div>
                                        {expense.description && (
                                            <div className="text-xs text-zinc-500 mt-0.5 max-w-xs truncate">{expense.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(expense.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-rose-600 dark:text-rose-400">
                                        -${expense.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(expense)}
                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense._id)}
                                                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-rose-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredExpenses.length === 0 && (
                        <div className="py-20 text-center text-zinc-500">
                            <Receipt className="h-10 w-10 mx-auto text-zinc-300 mb-4" />
                            <p className="font-medium">No expenses found</p>
                            <p className="text-xs">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-black">{editingExpense ? "Edit Expense" : "New Expense"}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Expense Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g., AWS Subscription"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Amount ($)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</label>
                                <select
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                                    placeholder="Add details about this expense..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

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
                                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {editingExpense ? "Update Expense" : "Save Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
