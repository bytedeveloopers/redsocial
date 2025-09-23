<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use App\Notifications\PostCommented;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Crear un nuevo comentario para un post
     */
    public function store(Request $request, Post $post)
    {
        $request->validate([
            'body' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);
        
        $user = Auth::user();
        
        $comment = Comment::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'body' => $request->body,
            'parent_id' => $request->parent_id,
        ]);
        
        // Cargar la relación del usuario para devolver datos completos
        $comment->load('user');
        
        // Enviar notificación al dueño del post (solo si no es el mismo usuario)
        if ($post->user_id !== $user->id) {
            $post->user->notify(new PostCommented($user, $post, $comment));
        }
        
        return response()->json([
            'comment' => $comment,
            'comments_count' => $post->comments()->count(),
        ]);
    }
}