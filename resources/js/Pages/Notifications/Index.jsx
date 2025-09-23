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

  const deleteNotification = async (notificationId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      return;
    }

    try {
      await fetch(`/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
      });
      router.reload({ only: ['notifications'] });
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      alert('Error al eliminar la notificación');
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar TODAS las notificaciones? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      await fetch('/notifications', {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
      });
      router.reload({ only: ['notifications'] });
    } catch (error) {
      console.error('Error al eliminar todas las notificaciones:', error);
      alert('Error al eliminar las notificaciones');
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
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Notificaciones
          </h2>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 disabled:opacity-50 font-medium transition-colors duration-300"
              >
                {loading ? 'Marcando...' : `Marcar todas como leídas (${unreadCount})`}
              </button>
            )}
            {notifications.data.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                disabled={loading}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 font-medium transition-colors duration-300"
              >
                {loading ? 'Eliminando...' : 'Eliminar todas'}
              </button>
            )}
          </div>
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
                      ? 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-violet-500/10 dark:shadow-indigo-500/20' 
                      : 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 border border-violet-200 dark:border-indigo-600/50 shadow-violet-500/20 dark:shadow-indigo-500/30 ring-2 ring-violet-200/50 dark:ring-indigo-400/30'
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-lg transition-colors duration-300">
                          {getNotificationIcon(notification.data.type)}
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={getNotificationAction(notification)}
                        onClick={() => !notification.read_at && markAsRead(notification.id)}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 -m-2 p-2 rounded transition-colors duration-300"
                      >
                        <p className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                          {notification.data.title}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                          {notification.data.message}
                        </p>
                        
                        {/* Preview adicional para posts */}
                        {(notification.data.type === 'like' || notification.data.type === 'comment') && notification.data.post_preview && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic transition-colors duration-300">
                            "{notification.data.post_preview}"
                          </p>
                        )}
                        
                        {/* Preview del comentario */}
                        {notification.data.type === 'comment' && notification.data.comment_preview && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-gray-100 dark:bg-gray-700 p-2 rounded transition-colors duration-300">
                            💬 {notification.data.comment_preview}
                          </p>
                        )}
                        
                        {/* Preview del mensaje */}
                        {notification.data.type === 'message_received' && notification.data.message_preview && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-2 border-green-400 dark:border-green-500 transition-colors duration-300">
                            📩 "{notification.data.message_preview}"
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 transition-colors duration-300">
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

                    {/* Botones de acción */}
                    <div className="flex-shrink-0 flex items-start gap-2">
                      {/* Botón eliminar */}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300 transform hover:scale-110"
                        title="Eliminar notificación"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                      
                      {/* Indicador de no leída */}
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="h-3 w-3 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors duration-300"
                          title="Marcar como leída"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-8 text-center shadow-xl shadow-violet-500/10 dark:shadow-indigo-500/20 transition-colors duration-300">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base transition-colors duration-300">
                No tienes notificaciones todavía.
              </p>
              <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-2 transition-colors duration-300">
                Cuando alguien interactúe con tus posts o te siga, las notificaciones aparecerán aquí.
              </p>
            </div>
          )}

          {/* Paginación */}
          {(notifications.prev_page_url || notifications.next_page_url) && (
            <div className="mt-6 flex items-center justify-between">
              {notifications.prev_page_url ? 
                <Link 
                  href={notifications.prev_page_url} 
                  preserveScroll 
                  className="px-4 py-2 bg-white/70 dark:bg-gray-800/70 text-violet-600 dark:text-violet-400 border border-violet-200/30 dark:border-gray-600/30 rounded-lg hover:bg-violet-50/80 dark:hover:bg-gray-700/80 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-300"
                >
                  ← Anterior
                </Link> : 
                <span />
              }
              {notifications.next_page_url ? 
                <Link 
                  href={notifications.next_page_url} 
                  preserveScroll 
                  className="px-4 py-2 bg-white/70 dark:bg-gray-800/70 text-violet-600 dark:text-violet-400 border border-violet-200/30 dark:border-gray-600/30 rounded-lg hover:bg-violet-50/80 dark:hover:bg-gray-700/80 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-300"
                >
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