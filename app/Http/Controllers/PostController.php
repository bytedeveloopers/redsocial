<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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
}
