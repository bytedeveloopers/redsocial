<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
use App\Notifications\PostLiked;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    /**
     * Toggle like/unlike para un post
     */
    public function toggle(Post $post)
    {
        $user = Auth::user();
        
        // Verificar si el usuario ya dio like a este post
        $existingLike = Like::where('post_id', $post->id)
                           ->where('user_id', $user->id)
                           ->first();
        
        if ($existingLike) {
            // Si ya existe el like, lo eliminamos (unlike)
            $existingLike->delete();
            $liked = false;
        } else {
            // Si no existe, creamos el like
            Like::create([
                'post_id' => $post->id,
                'user_id' => $user->id,
            ]);
            $liked = true;
            
            // Enviar notificación al dueño del post (solo si no es el mismo usuario)
            if ($post->user_id !== $user->id) {
                $post->user->notify(new PostLiked($user, $post));
            }
        }
        
        // Contar los likes actuales del post
        $likesCount = $post->likes()->count();
        
        return response()->json([
            'liked' => $liked,
            'likes_count' => $likesCount,
        ]);
    }
}