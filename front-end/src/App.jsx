import { useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
} from "react-router-dom";
import api from "./api/axios";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function AppRoutes({ user, isBooting, onAuthenticated, onLogout }) {
    const navigate = useNavigate();

    if (isBooting) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="glass-panel animate-rise w-full max-w-xl rounded-[2rem] p-8 text-center">
                    <p className="mb-3 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                        Facebook
                    </p>
                    <h1 className="display-font text-4xl text-[var(--text)]">
                        Loading...
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                        We&apos;re loading the feed.
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <Routes>
                <Route
                    path="/login"
                    element={
                        <Login
                            onSuccess={onAuthenticated}
                            onSwitchToRegister={() => navigate("/register")}
                        />
                    }
                />
                <Route
                    path="/register"
                    element={
                        <Register
                            onSuccess={onAuthenticated}
                            onSwitchToLogin={() => navigate("/login")}
                        />
                    }
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/feed" element={<Feed user={user} onLogout={onLogout} />} />
            <Route
                path="/profile"
                element={<Profile user={user} onLogout={onLogout} />}
            />
            <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
    );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [isBooting, setIsBooting] = useState(() =>
        Boolean(localStorage.getItem("token")),
    );

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const loadUser = async () => {
            try {
                const res = await api.get("/auth/me");
                setUser(res.data);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            } finally {
                setIsBooting(false);
            }
        };

        loadUser();
    }, []);

    const handleAuthenticated = ({ token, user: authenticatedUser }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
    };

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // Clear local auth state even if the token is already invalid.
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
        }
    };

    return (
        <BrowserRouter>
            <AppRoutes
                user={user}
                isBooting={isBooting}
                onAuthenticated={handleAuthenticated}
                onLogout={handleLogout}
            />
        </BrowserRouter>
    );
}
