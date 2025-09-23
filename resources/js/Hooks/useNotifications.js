import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export function useNotifications() {
  const { auth } = usePage().props;
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const intervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const echoChannelRef = useRef(null);

  const fetchUnreadCount = async () => {
    // Solo hacer petición si estamos online
    if (!isOnline) return;
    
    try {
      const response = await fetch('/notifications/count', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUnreadCount(data.count);
      
      // Reiniciar intervalo normal si había errores
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
        startInterval();
      }
    } catch (error) {
      console.error('Error fetching notifications count:', error);
      
      // En caso de error, pausar las peticiones automáticas por un tiempo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Reintentar después de 60 segundos
      retryTimeoutRef.current = setTimeout(() => {
        fetchUnreadCount();
      }, 60000);
    }
  };

  const startInterval = () => {
    if (intervalRef.current) return; // Ya existe
    
    // Con WebSockets, hacer polling menos frecuente (solo como fallback)
    intervalRef.current = setInterval(fetchUnreadCount, 120000); // 2 minutos
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const setupWebSocketListeners = () => {
    if (!auth?.user || !window.Echo) return;

    try {
      // Configurar listener de notificaciones
      echoChannelRef.current = window.Echo.private(`notifications.${auth.user.id}`);
      
      echoChannelRef.current.listen('.notification.sent', (e) => {
        console.log('Nueva notificación recibida vía WebSocket:', e);
        setUnreadCount(e.unread_count);
        
        // Mostrar notificación del navegador
        if (Notification.permission === 'granted') {
          new Notification(e.notification.title || 'Nueva notificación', {
            body: e.notification.message,
            icon: '/favicon.ico'
          });
        }
      });

      // Solicitar permisos de notificación
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      console.log('WebSocket listeners configurados para notificaciones');
    } catch (error) {
      console.error('Error configurando WebSocket listeners:', error);
    }
  };

  const cleanupWebSocketListeners = () => {
    if (echoChannelRef.current && auth?.user) {
      try {
        window.Echo.leave(`notifications.${auth.user.id}`);
        echoChannelRef.current = null;
        console.log('WebSocket listeners limpiados');
      } catch (error) {
        console.error('Error limpiando WebSocket listeners:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const response = await fetch('/notifications/read-all', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Detectar cambios de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      fetchUnreadCount();
      startInterval();
      setupWebSocketListeners();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      stopInterval();
      cleanupWebSocketListeners();
    };

    // Eventos de conectividad
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Configuración inicial
    fetchUnreadCount();
    startInterval();
    setupWebSocketListeners();

    // Cleanup
    return () => {
      stopInterval();
      cleanupWebSocketListeners();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [auth?.user?.id]);

  // Actualizar cuando la página recupera el foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isOnline) {
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOnline]);

  return {
    unreadCount,
    loading,
    isOnline,
    fetchUnreadCount,
    markAllAsRead
  };
}