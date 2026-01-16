"use client";

import React, { useEffect, useState } from "react";
import ProfileEdit from "@/components/profile/ProfileEdit";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            router.push("/login");
            return;
        }
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (error) {
            console.error("Error fetching profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (updatedData: any) => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        const formData = new FormData();
        formData.append("name", updatedData.name);
        formData.append("email", updatedData.email);
        formData.append("address", updatedData.address);
        formData.append("phone", updatedData.phone);

        if (updatedData.profilePictureFile) {
            formData.append("profilePicture", updatedData.profilePictureFile);
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                    // No Content-Type header needed for FormData; browser sets it with boundary
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                alert("Profile updated successfully!");
                // Update localStorage if needed (e.g., if name/email changed)
                const updatedUserInfo = {
                    ...JSON.parse(userInfo),
                    name: data.name,
                    email: data.email,
                    profilePicture: data.profilePicture
                };
                localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
                window.dispatchEvent(new Event('storage')); // Trigger update in other components
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile", error);
            alert("An error occurred while saving");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight">Profile Settings</h1>
                <p className="text-zinc-500 mt-1">Update your professional information for invoices.</p>
            </div>
            {profile && (
                <ProfileEdit initialData={profile} onSave={handleSaveProfile} />
            )}
        </div>
    );
}
