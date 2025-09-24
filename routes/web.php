<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Controladores de la app
use App\Http\Controllers\FeedController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ChatController;

// HOME → Feed
Route::get('/', [FeedController::class, 'index'])->name('feed.index');

// Endpoint para refrescar CSRF token
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf.token');

// Perfiles públicos de usuarios
Route::get('/user/{user}', [UserController::class, 'show'])->name('user.show');

// Búsqueda de usuarios (pública)
Route::get('/search/users', [SearchController::class, 'users'])->name('search.users');

// (Opcional) conservar la página de bienvenida de Laravel
Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard (Breeze) - Redirigir al inicio
Route::get('/dashboard', function () {
    return redirect('/');
})->middleware(['auth', 'verified'])->name('dashboard');

// Rutas protegidas
Route::middleware('auth')->group(function () {
    // Posts
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('/posts/{post}/like', [LikeController::class, 'toggle'])->name('posts.like');
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('posts.comment');

    // Seguimientos
    Route::post('/users/{user}/follow', [FollowController::class, 'follow'])->name('users.follow');
    Route::delete('/users/{user}/follow', [FollowController::class, 'unfollow'])->name('users.unfollow');

    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');
    Route::delete('/notifications', [NotificationController::class, 'destroyAll'])->name('notifications.destroyAll');
    Route::get('/notifications/count', [NotificationController::class, 'unreadCount'])->name('notifications.count');

    // Chat
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/unread-count', [ChatController::class, 'unreadCount'])->name('chat.unreadCount');
    Route::get('/chat/start', [ChatController::class, 'start'])->name('chat.start');
    Route::post('/chat/start', [ChatController::class, 'startConversation'])->name('chat.startConversation');
    Route::get('/chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::delete('/chat/{conversation}', [ChatController::class, 'destroyConversation'])->name('chat.destroyConversation');
    Route::post('/chat/{conversation}/message', [ChatController::class, 'sendMessage'])->name('chat.sendMessage');
    Route::delete('/chat/{conversation}/messages/{message}', [ChatController::class, 'destroyMessage'])->name('chat.destroyMessage');
    Route::get('/chat/{conversation}/messages', [ChatController::class, 'getMessages'])->name('chat.getMessages');

    // Perfil (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Auth (Breeze)
require __DIR__.'/auth.php';
