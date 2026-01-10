"use client";

import React from "react";
import { Mail, Phone, MapPin, Save, Download } from "lucide-react";

interface InvoiceItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface InvoiceTemplateProps {
    data: {
        invoiceNumber: string;
        date: string;
        dueDate: string;
        freelancerDetails: {
            name: string;
            email: string;
            address: string;
            phone: string;
            profilePicture: string;
        };
        clientDetails: {
            name: string;
            email: string;
            address: string;
            phone: string;
        };
        items: InvoiceItem[];
        subtotal: number;
        discount: number;
        taxRate: number;
        shipping: number;
        totalAmount: number;
        notes?: string;
    };
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data }) => {
    const subtotalLessDiscount = data.subtotal - data.discount;
    const totalTax = (subtotalLessDiscount * data.taxRate) / 100;
    const themeColor = "#16a34a"; // System Green (Emerald 600)
    const borderColor = "#e5e7eb";
    const bgColor = "#f9fafb";

    return (
        <div
            id="invoice-template"
            style={{
                backgroundColor: '#ffffff',
                color: '#111827',
                fontFamily: "'Inter', system-ui, sans-serif",
                padding: '3rem',
                width: '850px',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}
        >
            {/* Header / Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: themeColor, margin: 0, letterSpacing: '-0.025em' }}>INVOICE</h1>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '1rem', fontWeight: '600' }}>#{data.invoiceNumber}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>Date</p>
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{new Date(data.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>Due Date</p>
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#ef4444' }}>{new Date(data.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile & Client Info Cards (Matching Form Style) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                {/* From Card */}
                <div style={{ padding: '1.5rem', borderRadius: '1rem', border: `1px solid ${borderColor}`, backgroundColor: bgColor }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '1rem' }}>From</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        {data.freelancerDetails.profilePicture && (
                            <img
                                src={data.freelancerDetails.profilePicture}
                                style={{ width: '50px', height: '50px', borderRadius: '0.75rem', objectFit: 'cover' }}
                            />
                        )}
                        <div style={{ fontSize: '0.875rem' }}>
                            <p style={{ margin: '0 0 0.25rem', fontWeight: '700', fontSize: '1.125rem' }}>{data.freelancerDetails.name}</p>
                            <p style={{ margin: '0.25rem 0', color: '#4b5563' }}>{data.freelancerDetails.email}</p>
                            <p style={{ margin: '0.25rem 0', color: '#4b5563' }}>{data.freelancerDetails.phone}</p>
                            <p style={{ margin: '0.25rem 0', color: '#4b5563', lineHeight: '1.4' }}>{data.freelancerDetails.address}</p>
                        </div>
                    </div>
                </div>

                {/* To Card */}
                <div style={{ padding: '1.5rem', borderRadius: '1rem', border: `1px solid ${borderColor}`, backgroundColor: bgColor }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '1rem' }}>Bill To</h3>
                    <div style={{ fontSize: '0.875rem' }}>
                        <p style={{ margin: '0 0 0.25rem', fontWeight: '700', fontSize: '1.125rem' }}>{data.clientDetails.name}</p>
                        <p style={{ margin: '0.25rem 0', color: '#4b5563' }}>{data.clientDetails.email}</p>
                        <p style={{ margin: '0.25rem 0', color: '#4b5563' }}>{data.clientDetails.phone}</p>
                        <p style={{ margin: '0.25rem 0', color: '#4b5563', lineHeight: '1.4' }}>{data.clientDetails.address}</p>
                    </div>
                </div>
            </div>

            {/* Table Styling matching the Form Items */}
            <div style={{ borderRadius: '1rem', border: `1px solid ${borderColor}`, overflow: 'hidden', marginBottom: '3rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: bgColor }}>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#6b7280', borderBottom: `1px solid ${borderColor}` }}>Description</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#6b7280', borderBottom: `1px solid ${borderColor}`, textAlign: 'center', width: '80px' }}>Qty</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#6b7280', borderBottom: `1px solid ${borderColor}`, textAlign: 'right', width: '120px' }}>Rate</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#6b7280', borderBottom: `1px solid ${borderColor}`, textAlign: 'right', width: '120px' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: '1.25rem 1rem', borderBottom: index === data.items.length - 1 ? 'none' : `1px solid ${borderColor}` }}>
                                    <p style={{ margin: 0, fontWeight: '600' }}>{item.description}</p>
                                </td>
                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', borderBottom: index === data.items.length - 1 ? 'none' : `1px solid ${borderColor}`, color: '#4b5563' }}>{item.quantity}</td>
                                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', borderBottom: index === data.items.length - 1 ? 'none' : `1px solid ${borderColor}`, color: '#4b5563' }}>${item.rate.toFixed(2)}</td>
                                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '700', borderBottom: index === data.items.length - 1 ? 'none' : `1px solid ${borderColor}` }}>${item.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Row - Notes and Calculations */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3rem' }}>
                {/* Notes Column */}
                <div style={{ flex: 1 }}>
                    {data.notes && (
                        <div>
                            <h3 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '0.75rem' }}>Notes</h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {data.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Calculations Section */}
                <div style={{ width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: bgColor, borderRadius: '0.5rem', border: `1px solid ${borderColor}`, marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#6b7280' }}>Subtotal</span>
                        <span style={{ fontWeight: '700' }}>${data.subtotal.toFixed(2)}</span>
                    </div>

                    <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                            <span>Discount</span>
                            <span style={{ color: '#ef4444' }}>{data.discount > 0 ? `-$${data.discount.toFixed(2)}` : '$0.00'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                            <span>Tax ({data.taxRate}%)</span>
                            <span>${totalTax.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                            <span>Shipping</span>
                            <span>${(data.shipping || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: themeColor,
                        color: '#ffffff',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.4)'
                    }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</span>
                        <span style={{ fontSize: '1.75rem', fontWeight: '900' }}>${data.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Signatures Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6rem', marginBottom: '4rem' }}>
                <div style={{ textAlign: 'center', width: '250px' }}>
                    <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '0.75rem' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>Freelancer Signature</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>{data.freelancerDetails.name}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'center', width: '250px' }}>
                    <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '0.75rem' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>Customer Signature</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>{data.clientDetails.name}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem', borderTop: `1px solid ${borderColor}`, paddingTop: '2rem' }}>
                <p style={{ fontWeight: '700', color: '#4b5563', marginBottom: '0.5rem' }}>Thank you for your business!</p>
                <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto', fontStyle: 'italic' }}>
                    This is system generated invoice. Please make sure all things are correct before signing!
                </p>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
