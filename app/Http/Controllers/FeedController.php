<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $filter = $request->get('filter', 'all'); // 'all' o 'following'
        
        $query = Post::with(['user', 'likes', 'comments.user']);
        
        // Aplicar filtro según el parámetro
        if ($filter === 'following' && $user) {
            // Obtener IDs de usuarios que sigue + el usuario actual
            $followingIds = $user->following()->pluck('followed_user_id')->toArray();
            $followingIds[] = $user->id; // Incluir sus propios posts
            
            $query->whereIn('user_id', $followingIds);
        }
        
        $posts = $query->latest()
            ->paginate(10)
            ->through(fn ($p) => [
                'id' => $p->id,
                'body' => $p->body,
                'image' => $p->image_path,
                'user' => ['id' => $p->user->id, 'name' => $p->user->name],
                'created_at' => $p->created_at->diffForHumans(),
                'likes_count' => $p->likes->count(),
                'comments_count' => $p->comments->count(),
                'liked_by_user' => $user ? $p->likes->contains('user_id', $user->id) : false,
                'comments' => $p->comments->map(fn ($c) => [
                    'id' => $c->id,
                    'body' => $c->body,
                    'user' => ['id' => $c->user->id, 'name' => $c->user->name],
                    'created_at' => $c->created_at->diffForHumans(),
                ]),
            ]);

        return Inertia::render('Feed/Index', [
            'posts' => $posts,
            'currentFilter' => $filter,
            'followingCount' => $user ? $user->followingCount() : 0,
        ]);
    }
}
