import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import {
    formatHandle,
    getApiMessage,
    getImageUrl,
    getInitials,
} from "../utils/formatters";

export default function Profile({ user, onLogout }) {
    const navigate = useNavigate();
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                setError("");
                setIsLoading(true);

                const res = await api.get(`/auth/users/${user.id}/posts`);
                const postItems = Array.isArray(res.data.data)
                    ? res.data.data.map((post) => ({
                          ...post,
                          likes_count: post.likes_count ?? post.likes?.length ?? 0,
                          is_liked: Boolean(post.is_liked),
                      }))
                    : [];

                setUserPosts(postItems);
            } catch (err) {
                if (err.response?.status === 401) {
                    await onLogout();
                    return;
                }

                setError(getApiMessage(err, "Unable to load profile."));
            } finally {
                setIsLoading(false);
            }
        };

        loadUserProfile();
    }, [user.id, onLogout]);

    const handleAvatarUpdate = (newAvatarUrl) => {
        setCurrentUser((prevUser) => ({
            ...prevUser,
            avatar: newAvatarUrl,
        }));
    };

    const handleToggleLike = async (postId) => {
        const currentPost = userPosts.find((post) => post.id === postId);

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

        setUserPosts((currentPosts) =>
            currentPosts.map((post) => (post.id === postId ? updatedPost : post)),
        );

        try {
            await api.post(`/auth/posts/${postId}/like`);
        } catch (err) {
            setUserPosts((currentPosts) =>
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

            setUserPosts((currentPosts) =>
                currentPosts.filter((post) => post.id !== postId),
            );
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

            const newPost = {
                ...res.data.post,
                likes_count: 0,
                is_liked: false,
            };

            setUserPosts((currentPosts) => [newPost, ...currentPosts]);
        } catch (err) {
            if (err.response?.status === 401) {
                await onLogout();
            }

            throw err;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <header className="sticky top-0 z-20 border-b border-[#dddfe2] bg-white p-5">
                <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/feed")}
                        className="ghost-button px-3 py-2 text-sm"
                    >
                        ← Back
                    </button>

                    <div className="facebook-wordmark text-[2rem]">FlowFeed</div>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="accent-button px-4 py-2 text-sm"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-[1280px] px-4 py-6">
                <section className="glass-panel rounded-xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                        <div>
                            {currentUser.avatar ? (
                                <img
                                    src={getImageUrl(currentUser.avatar)}
                                    alt={currentUser.name}
                                    className="h-32 w-32 rounded-full object-cover"
                                />
                            ) : (
                                <div className="avatar-badge h-32 w-32 text-3xl">
                                    {getInitials(currentUser.name)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-[var(--text)]">
                                {currentUser.name}
                            </h1>
                            <p className="text-lg text-[var(--muted)]">
                                {formatHandle(currentUser)}
                            </p>

                            <div className="mt-4">
                                <p className="text-sm text-[var(--muted)]">
                                    Total posts: <span className="font-semibold text-[var(--text)]">{userPosts.length}</span>
                                </p>
                            </div>
                        </div>

                        <ProfilePictureUpload
                            user={currentUser}
                            onAvatarUpdate={handleAvatarUpdate}
                        />
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                        Posts
                    </h2>

                    {error ? (
                        <div className="rounded-xl border border-[rgba(201,43,43,0.18)] bg-[#fff1f2] px-4 py-3 text-sm text-[#c92b2b] mb-4">
                            {error}
                        </div>
                    ) : null}

                    {isLoading ? (
                        <div className="glass-panel rounded-xl p-10 text-center text-[var(--muted)]">
                            Loading posts...
                        </div>
                    ) : null}

                    {!isLoading && userPosts.length === 0 ? (
                        <div className="glass-panel rounded-xl p-10 text-center">
                            <h2 className="text-2xl font-bold text-[var(--text)]">
                                No posts yet
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                Create your first post from the feed.
                            </p>
                        </div>
                    ) : null}

                    <div className="space-y-4">
                        {userPosts.map((post) => (
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
                </section>
            </main>
        </div>
    );
}
