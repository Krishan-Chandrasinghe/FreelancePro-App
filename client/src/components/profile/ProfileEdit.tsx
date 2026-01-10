"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, Loader2 } from "lucide-react";

interface UserProfile {
    name: string;
    email: string;
    address: string;
    phone: string;
    profilePicture: string;
}

interface ProfileEditProps {
    initialData: UserProfile;
    onSave: (updatedData: UserProfile) => Promise<void>;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState<UserProfile>(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>(initialData.profilePicture || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreviewUrl(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Create a payload that includes the file if selected
            const dataToSave = { ...formData };
            if (selectedFile) {
                (dataToSave as any).profilePictureFile = selectedFile;
            }
            await onSave(dataToSave);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-zinc-400" />
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-primary-foreground rounded-2xl shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                            <Camera className="w-5 h-5" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black">{formData.name || "Freelancer Profile"}</h2>
                        <p className="text-zinc-500 font-medium">Manage your professional details</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">FullName</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                required
                                type="email"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                value={formData.phone}
                                placeholder="+94 70 291 0626"
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Physical Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <textarea
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold min-h-[100px]"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? "Saving..." : "Save Profile Details"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEdit;
