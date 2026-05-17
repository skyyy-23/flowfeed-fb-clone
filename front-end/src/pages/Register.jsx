import { useState } from "react";
import api from "../api/axios";
import AuthShell from "../components/AuthShell";
import { getApiMessage } from "../utils/formatters";

export default function Register({ onSuccess, onSwitchToLogin }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
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
            const res = await api.post("/auth/register", form);
            onSuccess(res.data);
        } catch (err) {
            setError(
                getApiMessage(err, "Registration failed. Please try again."),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthShell
            heroTitle="Create an account and jump straight into your FlowFeed."
            heroText="Register now to start sharing post and connect with FlowFeed."
            belowCardText={
                <>
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="font-semibold text-[var(--accent)] hover:underline"
                    >
                        Log in
                    </button>
                </>
            }
        >
            <div className="border-b border-[var(--line)] px-1 pb-4 text-center">
                <h2 className="text-[2rem] font-bold leading-tight text-[var(--accent)]">
                    Create a new account
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-4">
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="field-shell"
                    required
                />

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
                    placeholder="New password"
                    className="field-shell"
                    minLength={6}
                    required
                />

                {error ? (
                    <div className="rounded-lg border border-[rgba(217,72,46,0.2)] bg-[rgba(255,235,233,0.95)] px-4 py-3 text-sm text-[#c53929]">
                        {error}
                    </div>
                ) : null}

                <p className="px-1 text-xs leading-5 text-[var(--muted)] text-center">
                    By clicking Sign Up, you can create an account to access the FlowFeed.
                </p>

                <div className="flex justify-center pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="success-button min-h-[48px] min-w-[200px] px-8 text-[1.06rem]"
                    >
                        {isSubmitting ? "Creating account..." : "Sign Up"}
                    </button>
                </div>
            </form>
        </AuthShell>
    );
}
