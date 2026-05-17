<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Post $post)
    {
        $existingLike = Like::where('user_id', auth()->id())
            ->where('post_id', $post->id)
            ->first();

        
            if ($existingLike) {

            $existingLike->delete();

            return response()->json([
                'message' => 'Post unliked',
            ]);

             }

            Like::create([
                'user_id' => auth()->id(),
                'post_id' => $post->id,
            ]);
            
            return response()->json([
                'message' => 'Post liked',
            ]);
            
    }
}