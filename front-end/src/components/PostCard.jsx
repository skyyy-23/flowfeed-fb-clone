import { useState } from "react";
import CommentBox from "./CommentBox";
import {
    formatHandle,
    formatTimestamp,
    getApiMessage,
    getImageUrl,
    getInitials,
} from "../utils/formatters";

function formatLikes(count) {
    if (count === 1) {
        return "1 like";
    }

    return `${count} likes`;
}

export default function PostCard({
    post,
    currentUser,
    onToggleLike,
    onDeletePost,
    onSessionExpired,
    onShare,
}) {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [isLikePending, setIsLikePending] = useState(false);
    const [isDeletePending, setIsDeletePending] = useState(false);
    const [isSharePending, setIsSharePending] = useState(false);
    const [actionError, setActionError] = useState("");

    const isOwner = post.user_id === currentUser.id;

    const handleLike = async () => {
        setActionError("");
        setIsLikePending(true);

        try {
            await onToggleLike(post.id);
        } catch (err) {
            setActionError(getApiMessage(err, "Unable to update the like."));
        } finally {
            setIsLikePending(false);
        }
    };

    const handleDelete = async () => {
        const shouldDelete = window.confirm("Delete this post?");

        if (!shouldDelete) {
            return;
        }

        setActionError("");
        setIsDeletePending(true);

        try {
            await onDeletePost(post.id);
        } catch (err) {
            setActionError(getApiMessage(err, "Unable to delete this post."));
            setIsDeletePending(false);
        }
    };

    const handleShare = async () => {
        setActionError("");
        setIsSharePending(true);

        try {
            await onShare(post.id);
        } catch (err) {
            setActionError(getApiMessage(err, "Unable to share this post."));
        } finally {
            setIsSharePending(false);
        }
    };

    return (
        <article className="glass-panel rounded-xl">
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        {post.user?.avatar ? (
                            <img
                                src={getImageUrl(post.user.avatar)}
                                alt={post.user?.name}
                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="avatar-badge h-10 w-10 shrink-0 text-sm">
                                {getInitials(post.user?.name)}
                            </div>
                        )}

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <h3 className="truncate font-semibold text-[var(--text)]">
                                    {post.user?.name ?? "Unknown user"}
                                </h3>
                                <span className="text-sm text-[var(--muted)]">
                                    {formatHandle(post.user)}
                                </span>
                            </div>
                            <p className="text-xs text-[var(--muted)]">
                                {formatTimestamp(post.created_at)}
                            </p>
                        </div>
                    </div>

                    {isOwner ? (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeletePending}
                            className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[#f0f2f5] hover:text-[var(--text)]"
                        >
                            {isDeletePending ? "Deleting..." : "Delete"}
                        </button>
                    ) : null}
                </div>

                <div className="mt-3">
                    <p className="whitespace-pre-wrap text-[15px] leading-7 text-[var(--text)]">
                        {post.content?.trim()}
                    </p>
                </div>

                {post.photo && (
                    <div className="mt-3 -mx-4 -mb-4">
                        <img
                            src={getImageUrl(post.photo)}
                            alt="Post"
                            className="w-full object-cover"
                            style={{ maxHeight: "500px" }}
                        />
                    </div>
                )}

                {post.type === "repost" && post.repost ? (
                    <div className="mt-4 rounded-lg border border-[var(--line)] bg-[#f8f9fa] p-3">
                        <div className="mb-2 text-xs text-[var(--muted)]">
                            Shared from {post.repost.user?.name}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-[var(--text)]">
                            {post.repost.content?.trim()}
                        </p>
                        {post.repost.photo && (
                            <img
                                src={getImageUrl(post.repost.photo)}
                                alt="Original post"
                                className="mt-2 w-full rounded-lg object-cover"
                                style={{ maxHeight: "300px" }}
                            />
                        )}
                    </div>
                ) : null}

                {(post.likes_count ?? 0) > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)] mt-6">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[20px] font-bold text-white">
                            👍🏻
                        </span>
                        <span>{formatLikes(post.likes_count ?? 0)}</span>
                    </div>
                ) : null}
            </div>

            <div className="border-t border-[var(--line)] px-2 py-1.5">
                <div className="grid grid-cols-3 gap-1">
                    <button
                        type="button"
                        onClick={handleLike}
                        disabled={isLikePending}
                        className={`feed-action-button ${
                            post.is_liked ? "text-[var(--accent)]" : ""
                        }`}
                    >
                        {isLikePending ? "Saving..." : "Like"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsCommentsOpen((open) => !open)}
                        className="feed-action-button"
                    >
                        {isCommentsOpen ? "Hide comments" : "Comment"}
                    </button>

                    <button
                        type="button"
                        onClick={handleShare}
                        disabled={isSharePending}
                        className="feed-action-button"
                    >
                        {isSharePending ? "Sharing..." : "Share"}
                    </button>
                </div>
            </div>

            {actionError ? (
                <div className="px-4 pb-4">
                    <div className="rounded-lg border border-[rgba(201,43,43,0.18)] bg-[#fff1f2] px-4 py-3 text-sm text-[#c92b2b]">
                        {actionError}
                    </div>
                </div>
            ) : null}

            {isCommentsOpen ? (
                <CommentBox
                    postId={post.id}
                    currentUser={currentUser}
                    onSessionExpired={onSessionExpired}
                />
            ) : null}
        </article>
    );
}
