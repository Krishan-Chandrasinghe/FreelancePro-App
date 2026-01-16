"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, FileText, Download, Loader2, Trash2, MoreVertical, CheckCircle, Clock, XCircle, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import InvoiceTemplate from "@/components/invoices/InvoiceTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Invoice {
    _id: string;
    invoiceNumber: string;
    client: { name: string };
    date: string;
    dueDate: string;
    totalAmount: number;
    status: string;
    freelancerDetails?: any;
    clientDetails?: any;
    items?: any[];
    subtotal?: number;
    discount?: number;
    taxRate?: number;
    shipping?: number;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            router.push("/login");
            return;
        }
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (error) {
            console.error("Error fetching invoices", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                fetchInvoices();
                setActiveDropdown(null);
            }
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const handleDeleteInvoice = (id: string) => {
        setDeleteInvoiceId(id);
    };

    const confirmDelete = async () => {
        if (!deleteInvoiceId) return;

        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${deleteInvoiceId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchInvoices();
                setDeleteInvoiceId(null);
            }
        } catch (error) {
            console.error("Error deleting invoice", error);
        }
    };

    const cancelDelete = () => {
        setDeleteInvoiceId(null);
    };

    const handleSaveInvoice = async (invoiceData: any) => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            let body;
            const headers: any = {
                Authorization: `Bearer ${token}`
            };

            if (invoiceData.file) {
                const formData = new FormData();
                formData.append('client', invoiceData.client);
                formData.append('invoiceNumber', invoiceData.invoiceNumber);
                formData.append('date', invoiceData.date);
                formData.append('dueDate', invoiceData.dueDate);
                formData.append('subtotal', invoiceData.subtotal.toString());
                formData.append('discount', invoiceData.discount.toString());
                formData.append('taxRate', invoiceData.taxRate.toString());
                formData.append('shipping', invoiceData.shipping.toString());
                formData.append('totalAmount', invoiceData.totalAmount.toString());
                formData.append('status', invoiceData.status);

                if (invoiceData.project) formData.append('project', invoiceData.project);
                if (invoiceData.notes) formData.append('notes', invoiceData.notes);

                formData.append('items', JSON.stringify(invoiceData.items));
                formData.append('freelancerDetails', JSON.stringify(invoiceData.freelancerDetails));
                formData.append('clientDetails', JSON.stringify(invoiceData.clientDetails));

                formData.append('file', invoiceData.file, `Invoice_${invoiceData.invoiceNumber}.pdf`);

                body = formData;
            } else {
                body = JSON.stringify(invoiceData);
                headers["Content-Type"] = "application/json";
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
                method: "POST",
                headers: headers,
                body: body
            });

            if (res.ok) {
                fetchInvoices();
                setShowForm(false);
            } else {
                const error = await res.json();
                alert(error.message || "Failed to save invoice");
            }
        } catch (error) {
            console.error("Error saving invoice", error);
        }
    };

    const handleDownloadPDF = async (invoice: Invoice) => {
        setIsDownloading(invoice._id);
        setPreviewInvoice(invoice);

        // Wait for preview to render
        setTimeout(async () => {
            const element = document.getElementById("invoice-template");
            if (element) {
                const canvas = await html2canvas(element, { scale: 2 });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
            }
            setIsDownloading(null);
            setPreviewInvoice(null);
        }, 500);
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your professional invoices.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" /> Create Invoice
                </button>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by invoice # or client name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold appearance-none cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Complete">Complete</option>
                        <option value="Not Paid">Not Paid</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredInvoices.length === 0 ? (
                <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-12 text-center border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="bg-zinc-50 dark:bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">No matches found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter settings.</p>
                </div>
            ) : (
                <div className="rounded-2xl border bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800 max-h-[calc(100vh-280px)] overflow-auto relative">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 sticky top-0 z-20 backdrop-blur-sm">
                            <tr>
                                <th className="h-12 px-6 text-left align-middle font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Invoice #</th>
                                <th className="h-12 px-6 text-left align-middle font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Client</th>
                                <th className="h-12 px-6 text-left align-middle font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Date</th>
                                <th className="h-12 px-6 text-left align-middle font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Amount</th>
                                <th className="h-12 px-6 text-left align-middle font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Status</th>
                                <th className="h-12 px-6 text-right align-middle font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice._id} className="transition-colors hover:bg-muted/30">
                                    <td className="px-6 py-4 align-middle font-mono font-bold text-primary">{invoice.invoiceNumber}</td>
                                    <td className="px-6 py-4 align-middle font-medium">{invoice.client?.name}</td>
                                    <td className="px-6 py-4 align-middle text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 align-middle font-black text-lg">${invoice.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="relative" ref={activeDropdown === invoice._id ? dropdownRef : null}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === invoice._id ? null : invoice._id);
                                                }}
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${invoice.status === 'Complete' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40' :
                                                    invoice.status === 'Not Paid' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40' :
                                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/40'
                                                    }`}
                                            >
                                                {invoice.status === 'Complete' && <CheckCircle className="w-3 h-3" />}
                                                {invoice.status === 'Not Paid' && <XCircle className="w-3 h-3" />}
                                                {invoice.status === 'Pending' && <Clock className="w-3 h-3" />}
                                                {invoice.status}
                                            </button>

                                            {/* Status Dropdown */}
                                            {activeDropdown === invoice._id && (
                                                <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
                                                    {['Pending', 'Complete', 'Not Paid'].map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleUpdateStatus(invoice._id, s)}
                                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${invoice.status === s ? 'text-primary' : 'text-zinc-500'
                                                                }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleDownloadPDF(invoice)}
                                                disabled={isDownloading === invoice._id}
                                                title="Download PDF"
                                                className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20 disabled:opacity-50"
                                            >
                                                {isDownloading === invoice._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteInvoice(invoice._id)}
                                                title="Delete Invoice"
                                                className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
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
            )}

            {showForm && (
                <InvoiceForm
                    onClose={() => setShowForm(false)}
                    onSave={handleSaveInvoice}
                />
            )}

            {/* Hidden Preview for PDF generation */}
            {previewInvoice && (
                <div className="fixed left-[-9999px] top-0">
                    <InvoiceTemplate data={previewInvoice as any} />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteInvoiceId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-sm rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">Delete Invoice?</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Are you sure you want to delete this invoice? This action cannot be undone.
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
