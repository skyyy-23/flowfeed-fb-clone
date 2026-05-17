<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with(['user', 'likes', 'repost.user'])
            ->latest()
            ->paginate(10);

        $posts->getCollection()->transform(function ($post) {

            $post->likes_count = $post->likes->count();

            $post->is_liked = $post->likes
                ->contains('user_id', auth()->id());

            return $post;
        });

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => ['nullable', 'string'],
            'type' => ['required'],
            'photo' => ['nullable', 'string'],
        ]);

        $post = Post::create([
            'user_id' => auth()->id(),
            'content' => $validated['content'] ?? null,
            'type' => $validated['type'],
            'photo' => $validated['photo'] ?? null,
        ]);

        return response()->json([
            'message' => 'Post created successfully',
            'post' => $post->load('user'),
        ], 201);
    }

    public function show(Post $post)
    {
        return response()->json(
            $post->load('user')
        );
    }

    public function destroy(Post $post)
    {
        if ($post->user_id !== auth()->id()) {

            return response()->json([
                'message' => 'Unauthorized',
            ], 403);

        }

        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully',
        ]);
    }

    public function share(Post $post, Request $request)
    {
        $validated = $request->validate([
            'content' => ['nullable', 'string'],
        ]);

        $repost = Post::create([
            'user_id' => auth()->id(),
            'content' => $validated['content'] ?? null,
            'type' => 'repost',
            'repost_post_id' => $post->id,
        ]);

        return response()->json([
            'message' => 'Post shared successfully',
            'post' => $repost->load(['user', 'repost.user']),
        ], 201);
    }
}