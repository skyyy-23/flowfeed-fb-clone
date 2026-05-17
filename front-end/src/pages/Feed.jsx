import { useEffect, useState } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import {
    formatHandle,
    getApiMessage,
    getImageUrl,
    getInitials,
} from "../utils/formatters";

function normalizePost(post) {
    return {
        ...post,
        likes_count: post.likes_count ?? post.likes?.length ?? 0,
        is_liked: Boolean(post.is_liked),
    };
}

async function fetchPostPage(page) {
    const res = await api.get(`/auth/posts?page=${page}`);
    const postItems = Array.isArray(res.data.data)
        ? res.data.data.map(normalizePost)
        : [];

    return {
        postItems,
        pagination: {
            currentPage: res.data.current_page ?? page,
            lastPage: res.data.last_page ?? 1,
            total: res.data.total ?? postItems.length,
            nextPage: res.data.next_page_url
                ? (res.data.current_page ?? page) + 1
                : null,
        },
    };
}

export default function Feed({ user, onLogout }) {
    const [posts, setPosts] = useState([]);
    const [composer, setComposer] = useState("");
    const [composerPhoto, setComposerPhoto] = useState(null);
    const [composerPhotoPreview, setComposerPhotoPreview] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmittingPost, setIsSubmittingPost] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentUser, setCurrentUser] = useState(user);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        nextPage: null,
    });

    const firstName = currentUser.name?.split(" ")[0] ?? "friend";

    const loadPosts = async ({
        page = 1,
        append = false,
        showRefreshState = false,
    } = {}) => {
        try {
            setError("");

            if (append) {
                setIsLoadingMore(true);
            } else if (showRefreshState) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const { postItems, pagination: nextPagination } =
                await fetchPostPage(page);

            setPosts((currentPosts) =>
                append ? [...currentPosts, ...postItems] : postItems,
            );
            setPagination(nextPagination);
        } catch (err) {
            if (err.response?.status === 401) {
                await onLogout();
                return;
            }

            setError(getApiMessage(err, "Unable to load the feed."));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        const initializeFeed = async () => {
            try {
                setError("");

                const { postItems, pagination: nextPagination } =
                    await fetchPostPage(1);

                setPosts(postItems);
                setPagination(nextPagination);
            } catch (err) {
                if (err.response?.status === 401) {
                    await onLogout();
                    return;
                }

                setError(getApiMessage(err, "Unable to load the feed."));
            } finally {
                setIsLoading(false);
            }
        };

        initializeFeed();
    }, [onLogout]);

    const handleCreatePost = async (event) => {
        event.preventDefault();

        if (!composer.trim() && !composerPhoto) {
            setError("Write something or add a photo before posting.");
            return;
        }

        setError("");
        setIsSubmittingPost(true);

        try {
            let photoUrl = null;

            if (composerPhoto) {
                const formData = new FormData();
                formData.append("photo", composerPhoto);

                const uploadRes = await api.post("/auth/upload/photo", formData);

                photoUrl = uploadRes.data.photo;
            }

            const res = await api.post("/auth/posts", {
                content: composer.trim(),
                type: "text",
                photo: photoUrl,
            });

            const newPost = normalizePost({
                ...res.data.post,
                likes_count: 0,
                is_liked: false,
            });

            setPosts((currentPosts) => [newPost, ...currentPosts]);
            setPagination((currentPagination) => ({
                ...currentPagination,
                total: currentPagination.total + 1,
            }));
            setComposer("");
            setComposerPhoto(null);
            setComposerPhotoPreview(null);
        } catch (err) {
            if (err.response?.status === 401) {
                await onLogout();
                return;
            }

            setError(getApiMessage(err, "Unable to publish your post."));
        } finally {
            setIsSubmittingPost(false);
        }
    };

    const handlePhotoSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setComposerPhoto(file);
            const reader = new FileReader();
            reader.onload = (e) => setComposerPhotoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const clearPhotoSelection = () => {
        setComposerPhoto(null);
        setComposerPhotoPreview(null);
    };

    const handleAvatarUpdate = (newAvatarUrl) => {
        setCurrentUser((prevUser) => ({
            ...prevUser,
            avatar: newAvatarUrl,
        }));
    };

    const handleToggleLike = async (postId) => {
        const currentPost = posts.find((post) => post.id === postId);

        if (!currentPost) {
            return;
        }

        const updatedPost = {
            ...currentPost,
            is_liked: !currentPost.is_liked,
            likes_count: Math.max(
                0,
                (currentPost.likes_count ?? 0) + (currentPost.is_liked ? -1 : 1),
            ),
        };

        setPosts((currentPosts) =>
            currentPosts.map((post) => (post.id === postId ? updatedPost : post)),
        );

        try {
            await api.post(`/auth/posts/${postId}/like`);
        } catch (err) {
            setPosts((currentPosts) =>
                currentPosts.map((post) =>
                    post.id === postId ? currentPost : post,
                ),
            );

            if (err.response?.status === 401) {
                await onLogout();
            }

            throw err;
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await api.delete(`/auth/posts/${postId}`);

            setPosts((currentPosts) =>
                currentPosts.filter((post) => post.id !== postId),
            );
            setPagination((currentPagination) => ({
                ...currentPagination,
                total: Math.max(0, currentPagination.total - 1),
            }));
        } catch (err) {
            if (err.response?.status === 401) {
                await onLogout();
            }

            throw err;
        }
    };

    const handleSharePost = async (postId) => {
        try {
            const res = await api.post(`/auth/posts/${postId}/share`, {
                content: null,
            });

            const newPost = normalizePost({
                ...res.data.post,
                likes_count: 0,
                is_liked: false,
            });

            setPosts((currentPosts) => [newPost, ...currentPosts]);
            setPagination((currentPagination) => ({
                ...currentPagination,
                total: currentPagination.total + 1,
            }));
        } catch (err) {
            if (err.response?.status === 401) {
                await onLogout();
            }

            throw err;
        }
    };

    const myVisiblePosts = posts.filter((post) => post.user_id === user.id).length;

    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <header className="sticky top-0 z-20 border-b border-[#dddfe2] bg-white p-5">
                <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="facebook-wordmark text-[2rem]">FlowFeed</div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                loadPosts({ page: 1, showRefreshState: true })
                            }
                            disabled={isRefreshing}
                            className="ghost-button px-3 py-2 text-sm"
                        >
                            {isRefreshing ? "Refreshing..." : "Refresh"}
                        </button>

                        <div className="hidden items-center gap-2 rounded-full bg-[#f0f2f5] px-3 py-2 sm:flex">
                            {currentUser.avatar ? (
                                <img
                                    src={getImageUrl(currentUser.avatar)}
                                    alt={currentUser.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="avatar-badge h-8 w-8 text-xs">
                                    {getInitials(currentUser.name)}
                                </div>
                            )}
                            <span className="text-sm font-semibold text-[var(--text)]">
                                {firstName}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={onLogout}
                            className="accent-button px-4 py-2 text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,590px)_280px]">
                <aside className="order-2 hidden space-y-4 lg:order-1 lg:block">
                    <section className="glass-panel rounded-xl p-4">
                        <ProfilePictureUpload
                            user={currentUser}
                            onAvatarUpdate={handleAvatarUpdate}
                        />
                        <div className="mt-4">
                            <p className="font-semibold text-[var(--text)]">
                                {currentUser.name}
                            </p>
                            <p className="text-sm text-[var(--muted)]">
                                {formatHandle(currentUser)}
                            </p>
                        </div>
                    </section>
                </aside>

                <section className="order-1 min-w-0 space-y-4 lg:order-2">
                    <section className="glass-panel rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="avatar-badge h-10 w-10 shrink-0 text-sm">
                                {currentUser.avatar ? (
                                    <img
                                        src={getImageUrl(currentUser.avatar)}
                                        alt={currentUser.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    getInitials(currentUser.name)
                                )}
                            </div>

                            <form onSubmit={handleCreatePost} className="min-w-0 flex-1">
                                <textarea
                                    value={composer}
                                    onChange={(event) =>
                                        setComposer(event.target.value)
                                    }
                                    rows={3}
                                    placeholder={`What's on your mind, ${firstName}?`}
                                    className="field-shell min-h-[110px] resize-y rounded-2xl bg-[#f0f2f5]"
                                />

                                {composerPhotoPreview && (
                                    <div className="mt-3 relative">
                                        <img
                                            src={composerPhotoPreview}
                                            alt="Preview"
                                            className="w-full rounded-lg max-h-96 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearPhotoSelection}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
                                    <label className="cursor-pointer text-sm text-[var(--muted)] hover:text-[var(--text)]">
                                        📷 Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoSelect}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingPost}
                                        className="accent-button px-5 py-2.5 text-sm"
                                    >
                                        {isSubmittingPost ? "Posting..." : "Post"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {error ? (
                        <div className="rounded-xl border border-[rgba(201,43,43,0.18)] bg-[#fff1f2] px-4 py-3 text-sm text-[#c92b2b]">
                            {error}
                        </div>
                    ) : null}

                    {isLoading ? (
                        <div className="glass-panel rounded-xl p-10 text-center text-[var(--muted)]">
                            Loading posts...
                        </div>
                    ) : null}

                    {!isLoading && posts.length === 0 ? (
                        <div className="glass-panel rounded-xl p-10 text-center">
                            <h2 className="text-2xl font-bold text-[var(--text)]">
                                No posts yet
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                Create the first post from the composer above.
                            </p>
                        </div>
                    ) : null}

                    <div className="space-y-4">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUser={currentUser}
                                onToggleLike={handleToggleLike}
                                onDeletePost={handleDeletePost}
                                onShare={handleSharePost}
                                onSessionExpired={onLogout}
                            />
                        ))}
                    </div>

                    {pagination.nextPage ? (
                        <div className="flex justify-center pt-2">
                            <button
                                type="button"
                                onClick={() =>
                                    loadPosts({
                                        page: pagination.nextPage,
                                        append: true,
                                    })
                                }
                                disabled={isLoadingMore}
                                className="ghost-button px-6 py-3 text-sm"
                            >
                                {isLoadingMore
                                    ? "Loading more..."
                                    : "See more posts"}
                            </button>
                        </div>
                    ) : null}
                </section>

                <aside className="order-3 hidden space-y-4 xl:block">
                    <section className="glass-panel rounded-xl p-4">
                        <h2 className="text-[1.05rem] font-semibold text-[var(--muted)]">
                            About this feed
                        </h2>
                        <div className="mt-4 space-y-3 text-sm text-[var(--text)]">
                            <div className="rounded-lg bg-[#f0f2f5] px-4 py-3">
                                {pagination.total} total posts in the feed
                            </div>
                            <div className="rounded-lg bg-[#f0f2f5] px-4 py-3">
                                You have {myVisiblePosts} visible posts
                            </div>
                        </div>
                    </section>

                    <section className="glass-panel rounded-xl p-4">
                        <h2 className="text-[1.05rem] font-semibold text-[var(--muted)]">
                            Connected features
                        </h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text)]">
                            <li>Create posts.</li>
                            <li>Like and unlike posts instantly.</li>
                            <li>Share posts to your feed.</li>
                            <li>Open comments and reply in place.</li>
                            <li>Delete your own posts and comments.</li>
                        </ul>
                    </section>
                </aside>
            </main>
        </div>
    );
}
