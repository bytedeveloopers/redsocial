<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'body'  => ['required','string','max:500'],
            'image' => ['nullable','image','max:2048'],
        ]);

        $post = $request->user()->posts()->create(['body' => $data['body']]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('posts', 'public');
            $post->update(['image_path' => $path]);
        }

        return back()->with('success', '¡Publicado!');
    }

    /**
     * Eliminar un post
     */
    public function destroy(Request $request, Post $post)
    {
        // Verificar que el usuario sea el dueño del post
        if ($post->user_id !== $request->user()->id) {
            abort(403, 'No tienes permiso para eliminar este post');
        }

        // Eliminar la imagen si existe
        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }

        // Eliminar el post (esto también eliminará likes y comentarios por las relaciones)
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post eliminado correctamente'
        ]);
    }
}
