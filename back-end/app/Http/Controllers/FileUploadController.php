<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $user = auth()->user();

        if ($user->avatar) {
            $oldFile = public_path('uploads/avatars/' . basename($user->avatar));
            if (file_exists($oldFile)) {
                unlink($oldFile);
            }
        }

        $file = $request->file('avatar');
        $filename = Str::random(32) . '.' . $file->getClientOriginalExtension();

        if (!is_dir(public_path('uploads/avatars'))) {
            mkdir(public_path('uploads/avatars'), 0755, true);
        }

        $file->move(public_path('uploads/avatars'), $filename);
        $path = '/uploads/avatars/' . $filename;

        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Profile picture uploaded successfully',
            'avatar' => $path,
        ]);
    }

    public function uploadPostPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $file = $request->file('photo');
        $filename = Str::random(32) . '.' . $file->getClientOriginalExtension();

        if (!is_dir(public_path('uploads/posts'))) {
            mkdir(public_path('uploads/posts'), 0755, true);
        }

        $file->move(public_path('uploads/posts'), $filename);
        $path = '/uploads/posts/' . $filename;

        return response()->json([
            'message' => 'Photo uploaded successfully',
            'photo' => $path,
        ]);
    }
}
