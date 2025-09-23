import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';

export default function Index({ notifications }) {
  const { auth } = usePage().props;
  const [loading, setLoading] = useState(false);

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
      });
      router.reload({ only: ['notifications'] });
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch('/notifications/read-all', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
      });
      router.reload({ only: ['notifications'] });
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'message_received': return '📩';
      default: return '🔔';
    }
  };

  const getNotificationAction = (notification) => {
    const data = notification.data;
    
    switch (data.type) {
      case 'like':
        return `/user/${auth.user.id}#post-${data.post_id}`;
      case 'comment':
        return `/user/${auth.user.id}#post-${data.post_id}`;
      case 'follow':
        return `/user/${data.follower_id}`;
      case 'message_received':
        return data.url || `/chat/${data.conversation_id}`;
      default:
        return '/';
    }
  };

  const unreadCount = notifications.data.filter(n => !n.read_at).length;

  return (
    <AuthenticatedLayout 
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold">
            Notificaciones
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={loading}
              className="text-sm text-violet-600 hover:text-violet-700 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'Marcando...' : `Marcar todas como leídas (${unreadCount})`}
            </button>
          )}
        </div>
      }
    >
      <Head title="Notificaciones" />

      <div className="py-4 md:py-6">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          
          {notifications.data.length > 0 ? (
            <div className="space-y-4">
              {notifications.data.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-2xl p-4 shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    notification.read_at 
                      ? 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-violet-500/10' 
                      : 'bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 shadow-violet-500/20 ring-2 ring-violet-200/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar o icono */}
                    <div className="flex-shrink-0">
                      {notification.data.type === 'follow' && notification.data.follower_avatar ? (
                        <img 
                          src={`/storage/${notification.data.follower_avatar}`}
                          alt={notification.data.follower_name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-200"
                        />
                      ) : notification.data.type === 'like' && notification.data.liker_avatar ? (
                        <img 
                          src={`/storage/${notification.data.liker_avatar}`}
                          alt={notification.data.liker_name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-200"
                        />
                      ) : notification.data.type === 'comment' && notification.data.commenter_avatar ? (
                        <img 
                          src={`/storage/${notification.data.commenter_avatar}`}
                          alt={notification.data.commenter_name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-200"
                        />
                      ) : notification.data.type === 'message_received' && notification.data.sender_avatar ? (
                        <img 
                          src={`/storage/${notification.data.sender_avatar}`}
                          alt={notification.data.sender_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-lg">
                          {getNotificationIcon(notification.data.type)}
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={getNotificationAction(notification)}
                        onClick={() => !notification.read_at && markAsRead(notification.id)}
                        className="block hover:bg-gray-50 -m-2 p-2 rounded"
                      >
                        <p className="text-sm md:text-base font-medium text-gray-900">
                          {notification.data.title}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          {notification.data.message}
                        </p>
                        
                        {/* Preview adicional para posts */}
                        {(notification.data.type === 'like' || notification.data.type === 'comment') && notification.data.post_preview && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            "{notification.data.post_preview}"
                          </p>
                        )}
                        
                        {/* Preview del comentario */}
                        {notification.data.type === 'comment' && notification.data.comment_preview && (
                          <p className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded">
                            💬 {notification.data.comment_preview}
                          </p>
                        )}
                        
                        {/* Preview del mensaje */}
                        {notification.data.type === 'message_received' && notification.data.message_preview && (
                          <p className="text-xs text-gray-600 mt-2 bg-green-50 p-2 rounded border-l-2 border-green-400">
                            📩 "{notification.data.message_preview}"
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </Link>
                    </div>

                    {/* Indicador de no leída */}
                    {!notification.read_at && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="h-3 w-3 rounded-full bg-blue-500 hover:bg-blue-600"
                          title="Marcar como leída"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-gray-500 text-sm md:text-base">
                No tienes notificaciones todavía.
              </p>
              <p className="text-xs md:text-sm text-gray-400 mt-2">
                Cuando alguien interactúe con tus posts o te siga, las notificaciones aparecerán aquí.
              </p>
            </div>
          )}

          {/* Paginación */}
          {(notifications.prev_page_url || notifications.next_page_url) && (
            <div className="mt-6 flex items-center justify-between">
              {notifications.prev_page_url ? 
                <Link href={notifications.prev_page_url} preserveScroll className="text-indigo-600 hover:underline text-sm md:text-base">
                  ← Anterior
                </Link> : 
                <span />
              }
              {notifications.next_page_url ? 
                <Link href={notifications.next_page_url} preserveScroll className="text-indigo-600 hover:underline text-sm md:text-base">
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