<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Comment extends Model {
    protected $fillable = ['post_id','user_id','body','parent_id'];
    public function post(){ return $this->belongsTo(\App\Models\Post::class); }
    public function user(){ return $this->belongsTo(\App\Models\User::class); }
    public function parent(){ return $this->belongsTo(self::class, 'parent_id'); }
    public function children(){ return $this->hasMany(self::class, 'parent_id'); }
}
