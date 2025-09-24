import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import apiClient from '@/Utils/apiClient';

export default function Show({ conversation, messages: initialMessages, otherUser }) {
  const { auth } = usePage().props;
  const [messages, setMessages] = useState(initialMessages.data);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [lastMessageId, setLastMessageId] = useState(
    initialMessages.data.length > 0 ? Math.max(...initialMessages.data.map(m => m.id)) : 0
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling optimizado para nuevos mensajes (sin WebSockets)
  useEffect(() => {
    if (!conversation?.id) return;

    const fetchNewMessages = async () => {
      try {
        const response = await apiClient.get(
          `/chat/${conversation.id}/messages?last_message_id=${lastMessageId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.messages && data.messages.length > 0) {
            setMessages(prev => [...prev, ...data.messages]);
            setLastMessageId(Math.max(...data.messages.map(m => m.id)));
          }
        }
      } catch (error) {
        console.error('Error fetching new messages:', error);
      }
    };

    // Polling cada 3 segundos cuando la ventana está activa
    let interval;
    const startPolling = () => {
      interval = setInterval(fetchNewMessages, 3000);
    };

    const stopPolling = () => {
      if (interval) clearInterval(interval);
    };

    // Escuchar eventos de visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        stopPolling();
      }
    };

    // Iniciar polling si la página está visible
    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversation?.id, lastMessageId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setSending(true);
    setNewMessage(''); // Limpiar inmediatamente para mejor UX

    try {
      const response = await apiClient.post(`/chat/${conversation.id}/message`, {
        body: messageText
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.message) {
          setMessages(prev => [...prev, data.message]);
          setLastMessageId(data.message.id);
        }
      } else {
        // Si falla, restaurar el mensaje
        setNewMessage(messageText);
        
        if (response.status === 422) {
          const errorData = await response.json();
          console.error('Validation errors:', errorData.errors);
        } else {
          console.error('Error sending message:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restaurar el mensaje si hay error
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Agrupar mensajes por fecha
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <AuthenticatedLayout 
      header={
        <div className="flex items-center gap-3">
          <Link 
            href="/chat" 
            className="text-indigo-600 hover:text-indigo-700"
          >
            ← Volver
          </Link>
          <div className="flex items-center gap-3">
            {otherUser.avatar_path ? (
              <img 
                src={`/storage/${otherUser.avatar_path}`}
                alt={otherUser.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="text-lg md:text-xl font-semibold">
              {otherUser.name}
            </h2>
          </div>
        </div>
      }
    >
      <Head title={`Chat con ${otherUser.name}`} />

      <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-8rem)] flex flex-col">
        {/* Header móvil mejorado */}
        <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <Link 
            href="/chat" 
            className="text-indigo-600 hover:text-indigo-700 p-1 -ml-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          {otherUser.avatar_path ? (
            <img 
              src={`/storage/${otherUser.avatar_path}`}
              alt={otherUser.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
              {otherUser.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {otherUser.name}
            </h2>
            <p className="text-sm text-gray-500">En línea</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 overscroll-behavior-contain">
          <div className="mx-auto max-w-2xl py-4">
            {Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Separador de fecha */}
                <div className="flex justify-center my-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(dayMessages[0].created_at)}
                  </span>
                </div>

                {/* Mensajes del día */}
                {dayMessages.map((message, index) => {
                  const isOwn = message.sender_id === auth.user.id;
                  const showAvatar = !isOwn && (
                    index === 0 || 
                    dayMessages[index - 1].sender_id !== message.sender_id
                  );

                  return (
                    <div
                      key={message.id}
                      className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar del otro usuario */}
                      {!isOwn && (
                        <div className="mr-2 flex-shrink-0">
                          {showAvatar ? (
                            otherUser.avatar_path ? (
                              <img 
                                src={`/storage/${otherUser.avatar_path}`}
                                alt={otherUser.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                                {otherUser.name.charAt(0).toUpperCase()}
                              </div>
                            )
                          ) : (
                            <div className="h-8 w-8" />
                          )}
                        </div>
                      )}

                      {/* Mensaje */}
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-2' : 'mr-2'}`}>
                        <div
                          className={`rounded-lg px-3 py-2 text-sm ${
                            isOwn
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.body}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Formulario para enviar mensaje - Optimizado móvil */}
        <div className="border-t bg-white px-3 py-3 sm:px-6 sm:py-4 lg:px-8 safe-area-inset-bottom">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={sendMessage} className="flex gap-2 sm:gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 pr-12 resize-none focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm min-h-[2.75rem] max-h-32"
                  maxLength={1000}
                  rows={1}
                  style={{
                    fieldSizing: 'content' // Auto-resize height
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                {/* Contador de caracteres */}
                {newMessage.length > 800 && (
                  <span className="absolute right-3 bottom-1 text-xs text-gray-400">
                    {1000 - newMessage.length}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="flex-shrink-0 h-11 w-11 sm:h-10 sm:w-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 transform active:scale-95"
              >
                {sending ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}