"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, Download, Save } from "lucide-react";
import InvoiceTemplate from "./InvoiceTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoiceItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface Client {
    _id: string;
    name: string;
    email: string;
    address: string;
    phone: string;
}

interface Project {
    _id: string;
    name: string;
}

interface UserProfile {
    name: string;
    email: string;
    address: string;
    phone: string;
    profilePicture: string;
}

interface InvoiceFormProps {
    onClose: () => void;
    onSave: (invoiceData: any) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose, onSave }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [dueDate, setDueDate] = useState("");
    const [discount, setDiscount] = useState(0);
    const [taxRate, setTaxRate] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (selectedClient) {
            fetchProjects(selectedClient._id);
        } else {
            setProjects([]);
            setSelectedProjectId("");
        }
    }, [selectedClient]);

    const fetchProjects = async (clientId: string) => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);
        try {
            const res = await fetch(`http://127.0.0.1:5001/api/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                // Filter projects belonging to the client
                const clientProjects = data.filter((p: any) =>
                    (typeof p.client === 'object' ? p.client._id === clientId : p.client === clientId)
                );
                setProjects(clientProjects);
            }
        } catch (error) {
            console.error("Error fetching projects", error);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchProfile();
    }, []);

    const fetchClients = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);
        try {
            const res = await fetch("http://127.0.0.1:5001/api/clients", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error("Error fetching clients", error);
        }
    };

    const fetchProfile = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);
        try {
            const res = await fetch("http://127.0.0.1:5001/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (error) {
            console.error("Error fetching profile", error);
        }
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        if (field === "quantity" || field === "rate") {
            newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        }
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const subtotalLessDiscount = subtotal - discount;
    const totalTax = (subtotalLessDiscount * taxRate) / 100;
    const totalAmount = subtotalLessDiscount + totalTax + shipping;

    const invoiceData = {
        invoiceNumber,
        date,
        dueDate,
        freelancerDetails: {
            name: profile?.name || "",
            email: profile?.email || "",
            address: profile?.address || "",
            phone: profile?.phone || "",
            profilePicture: profile?.profilePicture || "",
        },
        clientDetails: {
            name: selectedClient?.name || "",
            email: selectedClient?.email || "",
            address: selectedClient?.address || "",
            phone: selectedClient?.phone || "",
        },
        items,
        subtotal,
        discount,
        taxRate,
        shipping,
        totalAmount,
        project: selectedProjectId || undefined,
        notes,
    };

    const handleDownloadPDF = async () => {
        return new Promise<void>((resolve) => {
            setShowPreview(true);
            // Wait for preview to render and images to load
            setTimeout(async () => {
                const element = document.getElementById("invoice-template");
                if (element) {
                    // Optimized for high resolution and no cropping
                    const canvas = await html2canvas(element, {
                        scale: 2, // 2x is plenty for clear text and small size
                        useCORS: true,
                        logging: false,
                        backgroundColor: "#ffffff",
                        windowWidth: 850
                    });

                    // Using JPEG instead of PNG significantly reduces file size (by 70-80%)
                    const imgData = canvas.toDataURL("image/jpeg", 0.75);
                    const pdf = new jsPDF({
                        orientation: "portrait",
                        unit: "mm",
                        format: "a4",
                        compress: true // Enable internal PDF compression
                    });

                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');
                    pdf.save(`Invoice_${invoiceNumber}.pdf`);
                }
                setShowPreview(false);
                resolve();
            }, 1000); // Increased timeout to 1s for better consistency
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient || !dueDate || items.length === 0) {
            alert("Please fill in all required fields.");
            return;
        }

        const hasInvalidItems = items.some(item => !item.description.trim());
        if (hasInvalidItems) {
            alert("Please ensure all items have a description.");
            return;
        }

        setIsGenerating(true);
        try {
            await handleDownloadPDF();
            onSave({
                client: selectedClient._id,
                ...invoiceData,
                status: 'Pending'
            });
        } catch (error) {
            console.error("Error generating invoice", error);
            alert("Failed to generate PDF invoice.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-4xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-2xl font-bold">Create New Invoice</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 opacity-70">Select Client *</label>
                                <select
                                    required
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    onChange={(e) => setSelectedClient(clients.find(c => c._id === e.target.value) || null)}
                                >
                                    <option value="">Choose a client</option>
                                    {clients.map(client => (
                                        <option key={client._id} value={client._id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 opacity-70">Project (Optional)</label>
                                <select
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-50"
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    disabled={!selectedClient}
                                >
                                    <option value="">No Project</option>
                                    {projects.map(project => (
                                        <option key={project._id} value={project._id}>{project.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 opacity-70">Invoice #</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={invoiceNumber}
                                        className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 outline-none font-mono cursor-not-allowed opacity-70"
                                        title="Invoice numbers are auto-generated"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 opacity-70">Due Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl space-y-2 border border-zinc-100 dark:border-zinc-800">
                            <h4 className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">My Details</h4>
                            {profile ? (
                                <div className="space-y-1 text-sm">
                                    <p className="font-bold">{profile.name}</p>
                                    <p className="opacity-70">{profile.email}</p>
                                    <p className="opacity-70">{profile.phone}</p>
                                    <p className="opacity-70 truncate">{profile.address}</p>
                                    <p className="text-[10px] text-primary mt-2 italic">* Info from your profile</p>
                                </div>
                            ) : (
                                <p className="text-sm opacity-50">Loading profile...</p>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-50">Invoice Items</h3>
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 w-20 text-center">Qty</th>
                                        <th className="px-4 py-3 w-32 text-right">Rate</th>
                                        <th className="px-4 py-3 w-32 text-right">Amount</th>
                                        <th className="px-4 py-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                                    className="w-full bg-transparent outline-none focus:text-primary transition-colors font-medium"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                                                    className="w-full bg-transparent outline-none text-center font-medium"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(index, "rate", Number(e.target.value))}
                                                    className="w-full bg-transparent outline-none text-right font-medium"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold">
                                                ${item.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button
                                type="button"
                                onClick={addItem}
                                className="w-full py-4 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>
                    </div>

                    {/* Bottom Section: Notes & Calculations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="block text-xs font-black uppercase tracking-widest opacity-50">Invoice Notes</label>
                            <textarea
                                placeholder="Additional information, payment terms, etc."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
                            />
                        </div>
                        <div className="flex justify-end">
                            <div className="w-full max-w-xs space-y-4">
                                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-lg">
                                    <span className="text-xs font-bold uppercase opacity-50">Subtotal</span>
                                    <span className="font-bold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="space-y-3 px-3">
                                    <div className="flex justify-between items-center gap-4">
                                        <label className="text-xs font-medium opacity-70 whitespace-nowrap">Discount ($)</label>
                                        <input
                                            type="number"
                                            value={discount}
                                            onChange={(e) => setDiscount(Number(e.target.value))}
                                            className="w-24 bg-transparent border-b border-zinc-200 dark:border-zinc-800 text-right outline-none focus:border-primary transition-all font-bold"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <label className="text-xs font-medium opacity-70 whitespace-nowrap">Tax Rate (%)</label>
                                        <input
                                            type="number"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(Number(e.target.value))}
                                            className="w-24 bg-transparent border-b border-zinc-200 dark:border-zinc-800 text-right outline-none focus:border-primary transition-all font-bold"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <label className="text-xs font-medium opacity-70 whitespace-nowrap">Shipping ($)</label>
                                        <input
                                            type="number"
                                            value={shipping}
                                            onChange={(e) => setShipping(Number(e.target.value))}
                                            className="w-24 bg-transparent border-b border-zinc-200 dark:border-zinc-800 text-right outline-none focus:border-primary transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-primary text-primary-foreground p-4 rounded-xl shadow-lg shadow-primary/20">
                                    <span className="text-xs font-black uppercase tracking-wider">Total Amount</span>
                                    <span className="text-2xl font-black">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end items-center pt-8 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" /> {isGenerating ? "Generating..." : "Generate & Download Invoice"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Hidden Preview for PDF generation */}
            {showPreview && (
                <div className="fixed left-[-9999px] top-0">
                    <InvoiceTemplate data={invoiceData} />
                </div>
            )}
        </div>
    );
};

export default InvoiceForm;
