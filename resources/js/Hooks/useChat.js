import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { fetchWithCsrf } from '@/Utils/csrfUtils';

export const useChat = () => {
  const { auth } = usePage().props;
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const intervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const channelRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!isOnline || !auth?.user) return;
    
    try {
      const response = await fetchWithCsrf('/chat/unread-count');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUnreadChatCount(data.count || 0);
      setError(null);
      
      // Reiniciar intervalo normal si había errores
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
        startInterval();
      }
    } catch (err) {
      // Solo loggear errores no relacionados con conectividad
      if (!err.message.includes('Failed to fetch')) {
        console.warn('Error al cargar mensajes no leídos:', err.message);
      }
      setError(err.message);
      
      // En caso de error, pausar las peticiones automáticas por un tiempo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Reintentar después de 30 segundos
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
      console.log('WebSocket listeners configurados para chat (modo desarrollo)');
    } catch (error) {
      console.warn('WebSocket no disponible, usando polling como fallback');
    }
  };

  const cleanupWebSocketListeners = () => {
    // Cleanup simplificado
    if (channelRef.current && auth?.user && window.Echo) {
      try {
        window.Echo.leave(`chat.${auth.user.id}`);
        channelRef.current = null;
        console.log('WebSocket listeners de chat limpiados');
      } catch (error) {
        console.warn('Error limpiando WebSocket listeners de chat:', error);
      }
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
    unreadChatCount, 
    error, 
    isOnline,
    refetch: fetchUnreadCount 
  };
};