<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Follow;
use App\Notifications\UserFollowed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    /**
     * Seguir a un usuario
     */
    public function follow(User $user)
    {
        $currentUser = Auth::user();
        
        // No puedes seguirte a ti mismo
        if ($currentUser->id === $user->id) {
            return response()->json(['error' => 'No puedes seguirte a ti mismo'], 400);
        }
        
        // Verificar si ya lo sigue
        if ($currentUser->isFollowing($user)) {
            return response()->json(['error' => 'Ya sigues a este usuario'], 400);
        }
        
        // Crear el seguimiento
        Follow::create([
            'user_id' => $currentUser->id,
            'followed_user_id' => $user->id,
        ]);
        
        // Enviar notificación al usuario seguido
        $user->notify(new UserFollowed($currentUser));
        
        return response()->json([
            'message' => 'Ahora sigues a ' . $user->name,
            'following' => true,
            'followers_count' => $user->followersCount(),
        ]);
    }
    
    /**
     * Dejar de seguir a un usuario
     */
    public function unfollow(User $user)
    {
        $currentUser = Auth::user();
        
        // Verificar si realmente lo sigue
        $follow = Follow::where('user_id', $currentUser->id)
                       ->where('followed_user_id', $user->id)
                       ->first();
        
        if (!$follow) {
            return response()->json(['error' => 'No sigues a este usuario'], 400);
        }
        
        // Eliminar el seguimiento
        $follow->delete();
        
        return response()->json([
            'message' => 'Has dejado de seguir a ' . $user->name,
            'following' => false,
            'followers_count' => $user->followersCount(),
        ]);
    }
}