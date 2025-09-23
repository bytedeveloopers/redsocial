<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Like extends Model {
    protected $fillable = ['post_id','user_id'];
    public function post(){ return $this->belongsTo(\App\Models\Post::class); }
    public function user(){ return $this->belongsTo(\App\Models\User::class); }
}
