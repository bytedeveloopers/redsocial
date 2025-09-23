<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SearchController extends Controller
{
    /**
     * Buscar usuarios por nombre
     */
    public function users(Request $request)
    {
        $query = $request->get('q', '');
        $currentUser = Auth::user();
        
        if (empty(trim($query))) {
            $users = collect([]);
        } else {
            $users = User::where('name', 'LIKE', "%{$query}%")
                        ->where('id', '!=', $currentUser ? $currentUser->id : 0) // Excluir usuario actual
                        ->limit(20)
                        ->get()
                        ->map(function ($user) use ($currentUser) {
                            return [
                                'id' => $user->id,
                                'name' => $user->name,
                                'bio' => $user->bio,
                                'avatar_path' => $user->avatar_path,
                                'location' => $user->location,
                                'followers_count' => $user->followersCount(),
                                'following_count' => $user->followingCount(),
                                'is_following' => $currentUser ? $currentUser->isFollowing($user) : false,
                            ];
                        });
        }

        return Inertia::render('Search/Users', [
            'users' => $users,
            'query' => $query,
        ]);
    }
}