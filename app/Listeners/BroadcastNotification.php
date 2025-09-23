<?php

namespace App\Listeners;

use App\Events\NotificationSent;
use Illuminate\Notifications\Events\NotificationSent as NotificationSentEvent;

class BroadcastNotification
{
    /**
     * Handle the event.
     */
    public function handle(NotificationSentEvent $event): void
    {
        // Solo hacer broadcast para notificaciones de base de datos
        if ($event->channel === 'database') {
            // Obtener los datos de la notificación
            $notificationData = $event->notification->toDatabase($event->notifiable);
            
            // Disparar el evento de broadcasting
            broadcast(new NotificationSent($notificationData, $event->notifiable));
        }
    }
}