import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';

export default function Index({ conversations }) {
  const { auth } = usePage().props;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 días
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  return (
    <AuthenticatedLayout 
      header={
        <h2 className="text-lg md:text-xl font-semibold">
          Mensajes
        </h2>
      }
    >
      <Head title="Mensajes" />

      <div className="py-4 md:py-6">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          
          {conversations.data.length > 0 ? (
            <div className="space-y-4">
              {conversations.data.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/chat/${conversation.id}`}
                  className="block"
                >
                  <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 p-4 shadow-xl shadow-violet-500/10 hover:shadow-violet-500/15 hover:bg-white/80 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      {/* Avatar del otro usuario */}
                      <div className="flex-shrink-0">
                        {conversation.other_user.avatar_path ? (
                          <img 
                            src={`/storage/${conversation.other_user.avatar_path}`}
                            alt={conversation.other_user.name}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-200"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg">
                            {conversation.other_user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Información de la conversación */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm md:text-base font-medium text-gray-900 truncate">
                            {conversation.other_user.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {conversation.last_message && (
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.last_message.created_at)}
                              </span>
                            )}
                            {conversation.unread_count > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full min-w-[1.25rem] h-5 shadow-lg animate-pulse">
                                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {conversation.last_message && (
                          <p className="text-xs md:text-sm text-gray-600 truncate mt-1">
                            {conversation.last_message.sender_id === auth.user.id ? 'Tú: ' : ''}
                            {conversation.last_message.body}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500 text-sm md:text-base">
                No tienes conversaciones todavía.
              </p>
              <p className="text-xs md:text-sm text-gray-400 mt-2">
                Busca usuarios y comienza a chatear con ellos.
              </p>
              <Link
                href="/search/users"
                className="mt-4 inline-block rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Buscar usuarios
              </Link>
            </div>
          )}

          {/* Paginación */}
          {(conversations.prev_page_url || conversations.next_page_url) && (
            <div className="mt-6 flex items-center justify-between">
              {conversations.prev_page_url ? 
                <Link href={conversations.prev_page_url} preserveScroll className="text-indigo-600 hover:underline text-sm md:text-base">
                  ← Anterior
                </Link> : 
                <span />
              }
              {conversations.next_page_url ? 
                <Link href={conversations.next_page_url} preserveScroll className="text-indigo-600 hover:underline text-sm md:text-base">
                  Siguiente →
                </Link> : 
                <span />
              }
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}