<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FileUploadController;

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::apiResource('posts', PostController::class);
        Route::post('/posts/{post}/like', [LikeController::class, 'toggle']);
        Route::post('/posts/{post}/share', [PostController::class, 'share']);

        Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
        Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
        Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

        Route::post('/upload/avatar', [FileUploadController::class, 'uploadProfilePicture']);
        Route::post('/upload/photo', [FileUploadController::class, 'uploadPostPhoto']);

    });
});