export function getImageUrl(path) {
    if (!path) {
        return null;
    }

    if (
        /^(?:[a-z]+:)?\/\//i.test(path) ||
        path.startsWith("data:") ||
        path.startsWith("blob:")
    ) {
        return path;
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
    const apiBase = new URL(apiUrl, window.location.origin);
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return new URL(normalizedPath, apiBase.origin).toString();
}

export function getInitials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "FC";
}

export function formatHandle(user) {
    if (user?.username) {
        return `@${user.username}`;
    }

    const source = user?.name ?? "facebookclone";

    return `@${source.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
}

export function formatTimestamp(value) {
    if (!value) {
        return "Just now";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Just now";
    }

    const diffMs = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) {
        return "Just now";
    }

    if (diffMs < hour) {
        return `${Math.floor(diffMs / minute)}m ago`;
    }

    if (diffMs < day) {
        return `${Math.floor(diffMs / hour)}h ago`;
    }

    if (diffMs < 7 * day) {
        return `${Math.floor(diffMs / day)}d ago`;
    }

    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function getApiMessage(error, fallback) {
    const response = error?.response?.data;

    if (response?.errors && typeof response.errors === "object") {
        const firstErrorList = Object.values(response.errors)[0];

        if (Array.isArray(firstErrorList) && firstErrorList[0]) {
            return firstErrorList[0];
        }
    }

    if (typeof response?.message === "string" && response.message.trim()) {
        return response.message;
    }

    return fallback;
}
