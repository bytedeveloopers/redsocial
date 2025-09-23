<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Mostrar el perfil público de un usuario
     */
    public function show(User $user)
    {
        $currentUser = Auth::user();
        
        // Cargar los posts del usuario con sus likes y comentarios
        $posts = $user->posts()
            ->with(['user', 'likes', 'comments.user'])
            ->latest()
            ->paginate(10)
            ->through(fn ($p) => [
                'id' => $p->id,
                'body' => $p->body,
                'image' => $p->image_path,
                'user' => ['id' => $p->user->id, 'name' => $p->user->name],
                'created_at' => $p->created_at->diffForHumans(),
                'likes_count' => $p->likes->count(),
                'comments_count' => $p->comments->count(),
                'liked_by_user' => $currentUser ? $p->likes->contains('user_id', $currentUser->id) : false,
                'comments' => $p->comments->map(fn ($c) => [
                    'id' => $c->id,
                    'body' => $c->body,
                    'user' => ['id' => $c->user->id, 'name' => $c->user->name],
                    'created_at' => $c->created_at->diffForHumans(),
                ]),
            ]);

        // Estadísticas del usuario
        $stats = [
            'posts_count' => $user->posts()->count(),
            'likes_received' => $user->posts()->withCount('likes')->get()->sum('likes_count'),
            'followers_count' => $user->followersCount(),
            'following_count' => $user->followingCount(),
        ];

        return Inertia::render('User/Show', [
            'profileUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'avatar_path' => $user->avatar_path,
                'location' => $user->location,
                'website' => $user->website,
                'created_at' => $user->created_at->format('F Y'),
            ],
            'posts' => $posts,
            'stats' => $stats,
            'isOwnProfile' => $currentUser && $currentUser->id === $user->id,
            'isFollowing' => $currentUser ? $currentUser->isFollowing($user) : false,
        ]);
    }
}