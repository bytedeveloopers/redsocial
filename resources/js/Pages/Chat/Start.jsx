import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';

export default function Start({ user }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const startConversation = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch('/chat/start', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: user.id,
          message: message.trim()
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.visit(`/chat/${data.conversation.id}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthenticatedLayout 
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Nuevo mensaje para {user.name}
        </h2>
      }
    >
      <Head title={`Mensaje para ${user.name}`} />

      <div className="py-12">
        <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
              {/* Header con información del usuario */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                {user.avatar_path ? (
                  <img 
                    src={`/storage/${user.avatar_path}`}
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-600">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">@{user.email.split('@')[0]}</p>
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={startConversation}>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    maxLength={1000}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {message.length}/1000 caracteres
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}