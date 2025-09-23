import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export const useChat = () => {
  const { auth } = usePage().props;
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/chat/unread-count', {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar mensajes no leídos');
      }
      
      const data = await response.json();
      setUnreadChatCount(data.count);
      setError(null);
    } catch (err) {
      console.error('Error al cargar mensajes no leídos:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Configurar WebSocket listener solo si hay usuario autenticado
    if (auth?.user && window.Echo) {
      const channel = window.Echo.private(`chat.${auth.user.id}`);
      
      channel.listen('.message.sent', (e) => {
        console.log('Nuevo mensaje recibido:', e);
        setUnreadChatCount(e.unread_chat_count);
        
        // Opcional: mostrar notificación del navegador
        if (Notification.permission === 'granted') {
          new Notification(`Mensaje de ${e.message.sender.name}`, {
            body: e.message.body.substring(0, 50) + (e.message.body.length > 50 ? '...' : ''),
            icon: '/favicon.ico'
          });
        }
      });

      // Cleanup al desmontar
      return () => {
        window.Echo.leave(`chat.${auth.user.id}`);
      };
    }
    
    // Fallback: polling cada 60 segundos si no hay WebSockets
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [auth?.user?.id]);

  return { unreadChatCount, error, refetch: fetchUnreadCount };
};