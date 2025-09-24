import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import GuestLayout from '@/Layouts/GuestLayout.jsx';

export default function Index({ posts, currentFilter, followingCount }) {
  const { auth, flash } = usePage().props;
  const { data, setData, post, processing, errors, reset } =
    useForm({ body: '', image: null });

  const [commentForms, setCommentForms] = useState({});
  const [showComments, setShowComments] = useState({});

  const submit = (e) => {
    e.preventDefault();
    post('/posts', { forceFormData: true, onSuccess: () => reset() });
  };

  const toggleLike = async (postId) => {
    try {
      const response = await fetch(`/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Recargar la página para actualizar los datos
        router.reload({ only: ['posts'] });
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const submitComment = async (postId, e) => {
    e.preventDefault();
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
        // Limpiar el formulario y recargar
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

  const FeedContent = (
    <>
      {/* Mensaje de flash para logout */}
      {flash?.success && (
        <div className="mb-6 rounded-2xl bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {flash.success}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header para usuarios no autenticados */}
      {!auth?.user && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white shadow-xl">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Bienvenido a SociaLink!</h1>
            <p className="text-violet-100 mb-4">Únete a nuestra comunidad y comparte tus momentos</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="px-6 py-3 bg-white text-violet-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-violet-500 text-white font-semibold rounded-xl hover:bg-violet-400 border-2 border-white/20 transition-all duration-300 transform hover:scale-105"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filtros de timeline (solo para usuarios autenticados) */}
      {auth?.user && (
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="flex w-full max-w-sm rounded-lg bg-white p-1 shadow">
            <Link
              href="/?filter=all"
              className={`flex-1 rounded-md px-3 sm:px-6 py-2 text-center text-sm font-medium transition-colors ${
                currentFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Para ti
            </Link>
            <Link
              href="/?filter=following"
              className={`flex-1 rounded-md px-3 sm:px-6 py-2 text-center text-sm font-medium transition-colors ${
                currentFilter === 'following'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">Siguiendo</span>
              <span className="sm:hidden">Siguiendo</span>
              {followingCount > 0 && ` (${followingCount})`}
            </Link>
          </div>
        </div>
      )}

      {auth?.user && (
        <form onSubmit={submit} className="mb-4 sm:mb-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 sm:p-6 shadow-xl shadow-violet-500/10 dark:shadow-indigo-500/20 transition-colors duration-300">
          <div className="flex gap-3">
            {/* Avatar del usuario */}
            <div className="flex-shrink-0">
              {auth.user.avatar_path ? (
                <img 
                  src={`/storage/${auth.user.avatar_path}`}
                  alt={auth.user.name}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-violet-200 dark:ring-indigo-400 transition-colors duration-300"
                />
              ) : (
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-sm font-bold text-white shadow-lg">
                  {auth.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Input de texto */}
            <div className="flex-1">
              <textarea
                className="w-full resize-none border-0 p-0 text-lg sm:text-base placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 bg-transparent text-gray-900 dark:text-white transition-colors duration-300"
                rows={data.body.length > 50 ? 4 : 2}
                placeholder="¿Qué estás pensando?"
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
                style={{ minHeight: '2.5rem' }}
              />
              {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
            </div>
          </div>

          {/* Área de botones y adjuntos */}
          <div className="mt-3 pt-3 border-t border-violet-200/50 dark:border-gray-600/50 transition-colors duration-300">
            <div className="flex items-center justify-between">
              {/* Botón de imagen */}
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-indigo-400 cursor-pointer transition-all duration-200 hover:bg-violet-50/50 dark:hover:bg-indigo-900/30 rounded-lg px-3 py-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Foto</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setData('image', e.target.files[0])}
                  className="hidden"
                />
              </label>
              
              {/* Botón publicar */}
              <button 
                disabled={processing || !data.body.trim()} 
                className="rounded-full bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {processing ? '...' : 'Publicar'}
              </button>
            </div>
            
            {/* Preview de imagen */}
            {data.image && (
              <div className="mt-3 relative">
                <img 
                  src={URL.createObjectURL(data.image)} 
                  alt="Preview" 
                  className="rounded-lg max-h-40 w-auto"
                />
                <button
                  type="button"
                  onClick={() => setData('image', null)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70"
                >
                  ×
                </button>
              </div>
            )}
            
            {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
          </div>
        </form>
      )}

      {flash?.success && <div className="mb-3 rounded bg-green-100 p-2">{flash.success}</div>}

      {/* Mensaje cuando no hay posts en "Siguiendo" */}
      {auth?.user && currentFilter === 'following' && posts.data.length === 0 && (
        <div className="mb-6 rounded-lg bg-white p-8 text-center shadow">
          <h3 className="text-lg font-medium text-gray-900">¡Tu timeline está vacío!</h3>
          <p className="mt-2 text-gray-600">
            Los usuarios que sigues aún no han publicado nada, o no sigues a nadie todavía.
          </p>
          <div className="mt-4 space-x-3">
            <Link
              href="/search/users"
              className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              🔍 Buscar usuarios para seguir
            </Link>
            <Link
              href="/?filter=all"
              className="inline-block rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Ver todos los posts
            </Link>
          </div>
        </div>
      )}

      <ul className="space-y-6">
        {posts.data.map((p) => (
          <li key={p.id} className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 shadow-xl shadow-violet-500/10 dark:shadow-indigo-500/20 hover:shadow-violet-500/15 dark:hover:shadow-indigo-500/30 hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 opacity-0 animate-pulse" style={{animation: 'fadeInUp 0.6s ease-out forwards', animationDelay: `${Math.random() * 0.3}s`}}>
            <div className="mb-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
              <Link href={`/user/${p.user.id}`} className="font-semibold hover:underline text-sm md:text-base hover:text-violet-600 dark:hover:text-indigo-400 transition-all duration-200">
                {p.user.name}
              </Link>
              {' · '}<span className="text-gray-400 dark:text-gray-500">{p.created_at}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm sm:text-base mb-3 text-gray-800 dark:text-gray-100 leading-relaxed transition-colors duration-300">{p.body}</p>
            {p.image && <img src={`/storage/${p.image}`} alt="" className="w-full rounded-xl max-h-64 sm:max-h-96 object-cover shadow-lg hover:scale-105 transition-transform duration-300" />}
            
            {/* Botones de interacción */}
            {auth?.user && (
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3 sm:gap-4 border-t border-violet-200/50 dark:border-gray-600/50 pt-4 transition-colors duration-300">
                <button
                  onClick={() => toggleLike(p.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                    p.liked_by_user 
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35' 
                      : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  style={{
                    animation: p.liked_by_user ? 'bounceGentle 0.8s ease-in-out' : 'none'
                  }}
                >
                  <span style={{
                    animation: p.liked_by_user ? 'bounceGentle 0.8s ease-in-out' : 'none',
                    display: 'inline-block'
                  }}>
                    {p.liked_by_user ? '❤️' : '🤍'}
                  </span>
                  <span className="hidden sm:inline">{p.likes_count} {p.likes_count === 1 ? 'like' : 'likes'}</span>
                  <span className="sm:hidden">{p.likes_count}</span>
                </button>
                
                <button
                  onClick={() => toggleComments(p.id)}
                  className="flex items-center gap-2 rounded-xl bg-gray-100/80 dark:bg-gray-700/80 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                  style={{
                    animation: showComments[p.id] ? 'scaleIn 0.4s ease-out' : 'none'
                  }}
                >
                  <span>💬</span>
                  <span className="hidden sm:inline">{p.comments_count} {p.comments_count === 1 ? 'comentario' : 'comentarios'}</span>
                  <span className="sm:hidden">{p.comments_count}</span>
                </button>
              </div>
            )}

            {/* Mostrar likes y comentarios para usuarios no autenticados */}
            {!auth?.user && (
              <div className="mt-4 flex items-center gap-4 border-t border-violet-200/50 pt-4 text-sm text-gray-500">
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
                      <div key={comment.id} className="rounded bg-gray-50 dark:bg-gray-700 p-3 border border-gray-200/30 dark:border-gray-600/30 transition-colors duration-300">
                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          <Link href={`/user/${comment.user.id}`} className="font-medium hover:underline text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                            {comment.user.name}
                          </Link>
                          {' · '}{comment.created_at}
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{comment.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        {posts.prev_page_url ? (
          <Link 
            href={posts.prev_page_url} 
            preserveScroll 
            className="px-4 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border border-gray-200/30 dark:border-gray-600/30 rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300"
          >
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        {posts.next_page_url ? (
          <Link 
            href={posts.next_page_url} 
            preserveScroll
            className="px-4 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border border-gray-200/30 dark:border-gray-600/30 rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300"
          >
            Siguiente →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </>
  );

  if (auth?.user) {
    return (
      <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Inicio</h2>}>
        <Head title="Inicio" />
        <div className="py-6">
          <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
            {FeedContent}
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <GuestLayout>
      <Head title="Inicio" />
      <div className="py-6">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {FeedContent}
        </div>
      </div>
    </GuestLayout>
  );
}
