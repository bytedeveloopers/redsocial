<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
use App\Notifications\PostLiked;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LikeController extends Controller
{
    /**
     * Toggle like/unlike para un post
     */
    public function toggle(Post $post)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }
            
            // Cargar la relación del usuario del post
            $post->load('user');
            
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
                if ($post->user_id !== $user->id && $post->user) {
                    $post->user->notify(new PostLiked($user, $post));
                }
            }
            
            // Contar los likes actuales del post
            $likesCount = $post->likes()->count();
            
            return response()->json([
                'liked' => $liked,
                'likes_count' => $likesCount,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en toggle like: ' . $e->getMessage(), [
                'post_id' => $post->id,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Error interno del servidor',
                'message' => 'No se pudo procesar la solicitud'
            ], 500);
        }
    }
}