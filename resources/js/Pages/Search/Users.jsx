import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import GuestLayout from '@/Layouts/GuestLayout.jsx';

export default function Users({ users, query }) {
  const { auth } = usePage().props;
  const [followingStates, setFollowingStates] = useState(
    users.reduce((acc, user) => ({ ...acc, [user.id]: user.is_following }), {})
  );

  const handleFollow = async (userId, isCurrentlyFollowing) => {
    if (!auth?.user) return;
    
    try {
      const url = `/users/${userId}/follow`;
      const response = await fetch(url, {
        method: isCurrentlyFollowing ? 'DELETE' : 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFollowingStates(prev => ({
          ...prev,
          [userId]: data.following
        }));
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
    }
  };

  const SearchContent = (
    <>
      {/* Barra de búsqueda */}
      <div className="mb-4 md:mb-6 rounded-lg bg-white p-4 shadow">
        <form method="GET" action="/search/users">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar usuarios por nombre..."
              className="flex-1 rounded border p-3 text-sm md:text-base focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 sm:px-6 py-3 text-sm md:text-base text-white hover:bg-indigo-700"
            >
              🔍 Buscar
            </button>
          </div>
        </form>
      </div>

      {/* Resultados */}
      {query && (
        <div className="mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            {users.length > 0 
              ? `Resultados para "${query}" (${users.length})`
              : `No se encontraron usuarios para "${query}"`
            }
          </h2>
        </div>
      )}

      {/* Lista de usuarios */}
      {users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-white p-4 shadow gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Avatar */}
                <Link href={`/user/${user.id}`} className="flex-shrink-0">
                  {user.avatar_path ? (
                    <img 
                      src={`/storage/${user.avatar_path}`} 
                      alt={user.name}
                      className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gray-200 text-sm md:text-lg font-bold text-gray-600">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                {/* Información del usuario */}
                <div className="min-w-0 flex-1">
                  <Link 
                    href={`/user/${user.id}`}
                    className="text-base md:text-lg font-medium text-gray-900 hover:underline block truncate"
                  >
                    {user.name}
                  </Link>
                  {user.bio && (
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                  )}
                  {user.location && (
                    <p className="text-xs text-gray-500">📍 {user.location}</p>
                  )}
                  <div className="mt-1 flex gap-3 md:gap-4 text-xs text-gray-500">
                    <span>{user.followers_count} seguidores</span>
                    <span>{user.following_count} siguiendo</span>
                  </div>
                </div>
              </div>

              {/* Botón seguir */}
              {auth?.user && (
                <button
                  onClick={() => handleFollow(user.id, followingStates[user.id])}
                  className={`rounded px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    followingStates[user.id]
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {followingStates[user.id] ? 'Siguiendo' : 'Seguir'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : query && (
        <div className="rounded-lg bg-white p-6 md:p-8 text-center shadow">
          <p className="text-gray-500 text-sm md:text-base">
            No se encontraron usuarios que coincidan con tu búsqueda.
          </p>
          <p className="mt-2 text-xs md:text-sm text-gray-400">
            Intenta con un nombre diferente o verifica la ortografía.
          </p>
        </div>
      )}

      {/* Estado inicial */}
      {!query && (
        <div className="rounded-lg bg-white p-6 md:p-8 text-center shadow">
          <p className="text-gray-500 text-sm md:text-base">
            Escribe el nombre de un usuario en la barra de búsqueda para empezar.
          </p>
        </div>
      )}
    </>
  );

  if (auth?.user) {
    return (
      <AuthenticatedLayout 
        header={
          <h2 className="text-xl font-semibold">
            Buscar Usuarios
          </h2>
        }
      >
        <Head title="Buscar Usuarios" />
        <div className="py-4 md:py-6">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            {SearchContent}
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <GuestLayout>
      <Head title="Buscar Usuarios" />
      <div className="mx-auto max-w-2xl p-4">{SearchContent}</div>
    </GuestLayout>
  );
}