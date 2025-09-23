import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import GuestLayout from '@/Layouts/GuestLayout.jsx';

export default function Show({ profileUser, posts, stats, isOwnProfile, isFollowing }) {
  const { auth } = usePage().props;
  const [commentForms, setCommentForms] = useState({});
  const [showComments, setShowComments] = useState({});
  const [following, setFollowing] = useState(isFollowing);
  const [followersCount, setFollowersCount] = useState(stats.followers_count);

  const toggleLike = async (postId) => {
    if (!auth?.user) return;
    
    try {
      const response = await fetch(`/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        router.reload({ only: ['posts'] });
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const submitComment = async (postId, e) => {
    e.preventDefault();
    if (!auth?.user) return;
    
    const body = commentForms[postId];
    if (!body || !body.trim()) return;

    try {
      const response = await fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      });
      
      if (response.ok) {
        setCommentForms(prev => ({ ...prev, [postId]: '' }));
        router.reload({ only: ['posts'] });
      }
    } catch (error) {
      console.error('Error al comentar:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleFollow = async () => {
    if (!auth?.user) return;
    
    try {
      const url = following 
        ? `/users/${profileUser.id}/follow`
        : `/users/${profileUser.id}/follow`;
      
      const response = await fetch(url, {
        method: following ? 'DELETE' : 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following);
        setFollowersCount(data.followers_count);
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
    }
  };

  const ProfileContent = (
    <>
      {/* Header del perfil */}
      <div className="mb-6 md:mb-8 rounded-lg bg-white p-4 md:p-6 shadow">
        <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            {profileUser.avatar_path ? (
              <img 
                src={`/storage/${profileUser.avatar_path}`}
                alt={profileUser.name}
                className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover ring-4 ring-violet-300 shadow-xl"
              />
            ) : (
              <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xl md:text-2xl font-bold text-white shadow-xl ring-4 ring-violet-300">
                {profileUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Información del usuario */}
          <div className="flex-grow w-full sm:w-auto">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profileUser.name}</h1>
                {profileUser.bio && (
                  <p className="mt-2 text-sm md:text-base text-gray-700">{profileUser.bio}</p>
                )}
                <div className="mt-2 space-y-1 text-xs md:text-sm text-gray-500">
                  <p>Miembro desde {profileUser.created_at}</p>
                  {profileUser.location && (
                    <p className="flex items-center justify-center sm:justify-start gap-1">
                      📍 {profileUser.location}
                    </p>
                  )}
                  {profileUser.website && (
                    <p className="flex items-center justify-center sm:justify-start gap-1">
                      🌐 <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 hover:underline transition-colors">
                        {profileUser.website}
                      </a>
                    </p>
                  )}
                </div>
                
                {/* Botones de acción */}
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  {isOwnProfile && (
                    <Link 
                      href="/profile" 
                      className="inline-block rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-2.5 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-800 hover:shadow-lg hover:shadow-violet-500/25 text-center transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Editar perfil
                    </Link>
                  )}
                  
                  {/* Botón seguir/dejar de seguir */}
                  {auth?.user && !isOwnProfile && (
                    <>
                      <button
                        onClick={handleFollow}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                          following
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {following ? 'Dejar de seguir' : 'Seguir'}
                      </button>
                      
                      <Link
                        href={`/chat/start?user=${profileUser.id}`}
                        className="inline-block rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 text-center"
                      >
                        Enviar mensaje
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              {/* Estadísticas */}
              <div className="flex justify-center lg:justify-end gap-4 md:gap-6 text-center mt-4 lg:mt-0">
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{stats.posts_count}</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Posts</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{followersCount}</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Seguidores</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.following_count}</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Siguiendo</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">{stats.likes_received}</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts del usuario */}
      <div className="space-y-4">
        {posts.data.length > 0 ? (
          posts.data.map((p) => (
            <div key={p.id} className="rounded-lg bg-white p-4 md:p-6 shadow">
              <div className="mb-2 text-xs md:text-sm text-gray-500">
                <Link href={`/user/${p.user.id}`} className="font-medium hover:underline text-sm md:text-base">
                  {p.user.name}
                </Link>
                {' · '}{p.created_at}
              </div>
              <p className="whitespace-pre-wrap text-sm md:text-base mb-3">{p.body}</p>
              {p.image && <img src={`/storage/${p.image}`} alt="" className="w-full rounded-lg max-h-64 sm:max-h-96 object-cover" />}
              
              {/* Botones de interacción */}
              {auth?.user && (
                <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-2 md:gap-4 border-t pt-3">
                  <button
                    onClick={() => toggleLike(p.id)}
                    className={`flex items-center gap-1 rounded px-3 py-2 text-sm ${
                      p.liked_by_user 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{p.liked_by_user ? '❤️' : '🤍'}</span>
                    <span className="hidden sm:inline">{p.likes_count} {p.likes_count === 1 ? 'like' : 'likes'}</span>
                    <span className="sm:hidden">{p.likes_count}</span>
                  </button>
                  
                  <button
                    onClick={() => toggleComments(p.id)}
                    className="flex items-center gap-1 rounded bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
                  >
                    <span>💬</span>
                    <span className="hidden sm:inline">{p.comments_count} {p.comments_count === 1 ? 'comentario' : 'comentarios'}</span>
                    <span className="sm:hidden">{p.comments_count}</span>
                  </button>
                </div>
              )}

              {/* Mostrar likes y comentarios para usuarios no autenticados */}
              {!auth?.user && (
                <div className="mt-3 md:mt-4 flex items-center gap-4 border-t pt-3 text-xs md:text-sm text-gray-500">
                  <span>❤️ {p.likes_count} {p.likes_count === 1 ? 'like' : 'likes'}</span>
                  <span>💬 {p.comments_count} {p.comments_count === 1 ? 'comentario' : 'comentarios'}</span>
                </div>
              )}

              {/* Sección de comentarios */}
              {auth?.user && showComments[p.id] && (
                <div className="mt-4 border-t pt-4">
                  {/* Formulario para nuevo comentario */}
                  <form onSubmit={(e) => submitComment(p.id, e)} className="mb-4">
                    <textarea
                      className="w-full resize-none rounded border p-2 text-sm"
                      rows={2}
                      placeholder="Escribe un comentario..."
                      value={commentForms[p.id] || ''}
                      onChange={(e) => setCommentForms(prev => ({ ...prev, [p.id]: e.target.value }))}
                    />
                    <button 
                      type="submit"
                      className="mt-2 rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                    >
                      Comentar
                    </button>
                  </form>

                  {/* Lista de comentarios */}
                  {p.comments.length > 0 && (
                    <div className="space-y-3">
                      {p.comments.map((comment) => (
                        <div key={comment.id} className="rounded bg-gray-50 p-3">
                          <div className="mb-1 text-xs text-gray-500">
                            <Link href={`/user/${comment.user.id}`} className="font-medium hover:underline">
                              {comment.user.name}
                            </Link>
                            {' · '}{comment.created_at}
                          </div>
                          <p className="text-sm">{comment.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-white p-6 md:p-8 text-center shadow">
            <p className="text-gray-500 text-sm md:text-base">
              {isOwnProfile ? 'Aún no has publicado nada.' : `${profileUser.name} aún no ha publicado nada.`}
            </p>
            {isOwnProfile && (
              <Link href="/" className="mt-2 inline-block text-indigo-600 hover:underline text-sm md:text-base">
                ¡Crea tu primer post!
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Paginación */}
      {(posts.prev_page_url || posts.next_page_url) && (
        <div className="mt-6 flex items-center justify-between">
          {posts.prev_page_url ? 
            <Link href={posts.prev_page_url} preserveScroll className="text-indigo-600 hover:underline">
              ← Anterior
            </Link> : 
            <span />
          }
          {posts.next_page_url ? 
            <Link href={posts.next_page_url} preserveScroll className="text-indigo-600 hover:underline">
              Siguiente →
            </Link> : 
            <span />
          }
        </div>
      )}
    </>
  );

  if (auth?.user) {
    return (
      <AuthenticatedLayout 
        header={
          <h2 className="text-xl font-semibold">
            Perfil de {profileUser.name}
          </h2>
        }
      >
        <Head title={`Perfil de ${profileUser.name}`} />
        <div className="py-4 md:py-6">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            {ProfileContent}
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <GuestLayout>
      <Head title={`Perfil de ${profileUser.name}`} />
      <div className="mx-auto max-w-2xl p-4">{ProfileContent}</div>
    </GuestLayout>
  );
}