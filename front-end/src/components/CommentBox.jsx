import { useEffect, useState } from "react";
import api from "../api/axios";
import {
    formatTimestamp,
    getApiMessage,
    getInitials,
} from "../utils/formatters";

export default function CommentBox({ postId, currentUser, onSessionExpired }) {
    const [comments, setComments] = useState([]);
    const [draft, setDraft] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        const loadComments = async () => {
            try {
                const res = await api.get(`/auth/posts/${postId}/comments`);
                setComments(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                if (err.response?.status === 401) {
                    await onSessionExpired();
                    return;
                }

                setError(getApiMessage(err, "Unable to load comments."));
            } finally {
                setIsLoading(false);
            }
        };

        loadComments();
    }, [onSessionExpired, postId]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!draft.trim()) {
            setError("Write a comment before posting.");
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            const res = await api.post(`/auth/posts/${postId}/comments`, {
                content: draft.trim(),
            });

            setComments((currentComments) => [res.data.comment, ...currentComments]);
            setDraft("");
        } catch (err) {
            if (err.response?.status === 401) {
                await onSessionExpired();
                return;
            }

            setError(getApiMessage(err, "Unable to add your comment."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        const shouldDelete = window.confirm("Delete this comment?");

        if (!shouldDelete) {
            return;
        }

        setPendingDeleteId(commentId);
        setError("");

        try {
            await api.delete(`/auth/comments/${commentId}`);

            setComments((currentComments) =>
                currentComments.filter((comment) => comment.id !== commentId),
            );
        } catch (err) {
            if (err.response?.status === 401) {
                await onSessionExpired();
                return;
            }

            setError(getApiMessage(err, "Unable to delete this comment."));
        } finally {
            setPendingDeleteId(null);
        }
    };

    return (
        <div className="border-t border-[var(--line)] bg-[#f7f8fa] px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-start gap-3">
                <div className="avatar-badge mt-1 h-8 w-8 shrink-0 text-[11px]">
                    {getInitials(currentUser.name)}
                </div>

                <div className="min-w-0 flex-1">
                    <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={2}
                        placeholder="Write a comment..."
                        className="field-shell min-h-[72px] resize-y rounded-2xl bg-white text-sm"
                    />

                    <div className="mt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="accent-button px-4 py-2 text-sm"
                        >
                            {isSubmitting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>
            </form>

            {error ? (
                <div className="mt-3 rounded-lg border border-[rgba(201,43,43,0.18)] bg-[#fff1f2] px-4 py-3 text-sm text-[#c92b2b]">
                    {error}
                </div>
            ) : null}

            <div className="mt-4 space-y-3">
                {isLoading ? (
                    <div className="text-sm text-[var(--muted)]">
                        Loading comments...
                    </div>
                ) : null}

                {!isLoading && comments.length === 0 ? (
                    <div className="text-sm text-[var(--muted)]">
                        No comments yet.
                    </div>
                ) : null}

                {comments.map((comment) => {
                    const isOwner = comment.user_id === currentUser.id;

                    return (
                        <article key={comment.id} className="flex items-start gap-3">
                            <div className="avatar-badge h-8 w-8 shrink-0 text-[11px]">
                                {getInitials(comment.user?.name)}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="rounded-2xl bg-[#edf2f7] px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-[var(--text)]">
                                                {comment.user?.name ?? "Unknown user"}
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--text)]">
                                                {comment.content}
                                            </p>
                                        </div>

                                        {isOwner ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(comment.id)
                                                }
                                                disabled={
                                                    pendingDeleteId === comment.id
                                                }
                                                className="text-xs font-medium text-[var(--muted)] hover:text-[var(--text)]"
                                            >
                                                {pendingDeleteId === comment.id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                <p className="mt-1 px-2 text-xs text-[var(--muted)]">
                                    {formatTimestamp(comment.created_at)}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
