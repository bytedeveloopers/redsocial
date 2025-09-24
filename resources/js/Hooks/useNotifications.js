import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { fetchWithCsrf } from '@/Utils/csrfUtils';

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
    if (!isOnline || !auth?.user) return;
    
    try {
      const response = await fetchWithCsrf('/notifications/count');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUnreadCount(data.count || 0);
      
      // Reiniciar intervalo normal si había errores
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
        startInterval();
      }
    } catch (error) {
      // Solo loggear errores no relacionados con conectividad
      if (!error.message.includes('Failed to fetch')) {
        console.warn('Error fetching notifications count:', error.message);
      }
      
      // En caso de error, pausar las peticiones automáticas por un tiempo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Reintentar después de 30 segundos (reducido de 60)
      if (!retryTimeoutRef.current) {
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          fetchUnreadCount();
        }, 30000);
      }
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
    // Temporalmente deshabilitado para evitar errores de conexión
    // Se puede habilitar cuando se configure Reverb o Pusher correctamente
    if (!auth?.user || !window.Echo) return;

    try {
      console.log('WebSocket listeners configurados para notificaciones (modo desarrollo)');
    } catch (error) {
      console.warn('WebSocket no disponible, usando polling como fallback');
    }
  };

  const cleanupWebSocketListeners = () => {
    // Cleanup simplificado
    if (echoChannelRef.current && auth?.user && window.Echo) {
      try {
        window.Echo.leave(`notifications.${auth.user.id}`);
        echoChannelRef.current = null;
        console.log('WebSocket listeners limpiados');
      } catch (error) {
        console.warn('Error limpiando WebSocket listeners:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const response = await fetchWithCsrf('/notifications/read-all', {
        method: 'POST',
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