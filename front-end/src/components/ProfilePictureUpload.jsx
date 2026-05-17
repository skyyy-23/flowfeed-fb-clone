import { useState } from "react";
import api from "../api/axios";
import { getImageUrl } from "../utils/formatters";

export default function ProfilePictureUpload({ user, onAvatarUpdate }) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError("");
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const res = await api.post("/auth/upload/avatar", formData);

            onAvatarUpdate(res.data.avatar);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to upload profile picture"
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative">
            <label className="cursor-pointer">
                <div className="avatar-badge h-16 w-16 text-lg relative group">
                    {user.avatar ? (
                        <img
                            src={getImageUrl(user.avatar)}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-sm">Change</span>
                    </div>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                    className="hidden"
                />
            </label>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            {isUploading && (
                <p className="text-xs text-[var(--muted)] mt-1">Uploading...</p>
            )}
        </div>
    );
}
