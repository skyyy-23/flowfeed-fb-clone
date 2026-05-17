import { useState } from "react";
import api from "../api/axios";
import AuthShell from "../components/AuthShell";
import { getApiMessage } from "../utils/formatters";

export default function Login({ onSuccess, onSwitchToRegister }) {
    const [form, setForm] = useState({
        email: "email@example.com",
        password: "password123",
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await api.post("/auth/login", form);
            onSuccess(res.data);
        } catch (err) {
            setError(getApiMessage(err, "Login failed. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthShell
            heroTitle="Connect with friends and the world around you on FlowFeed."
            heroText="Log in to see your feed, share posts, and interact with your friends."
            belowCardText={
                <>
                    <p className="">Create an account by clicking <span className="font-bold">create new account</span> to login to flowfeed.</p>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="field-shell"
                    required
                />

                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="field-shell"
                    required
                />

                {error ? (
                    <div className="rounded-lg border border-[rgba(217,72,46,0.2)] bg-[rgba(255,235,233,0.95)] px-4 py-3 text-sm text-[#c53929]">
                        {error}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="accent-button min-h-[48px] w-full text-xl"
                >
                    {isSubmitting ? "Logging in..." : "Log in"}
                </button>
            </form>

            <div className="auth-divider" />

            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="success-button min-h-[48px] px-6 text-[1.06rem]"
                >
                    Create new account
                </button>
            </div>
        </AuthShell>
    );
}
