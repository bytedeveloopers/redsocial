<?php

namespace App\Traits;

use App\Events\NotificationSent;

trait BroadcastsNotifications
{
    /**
     * Disparar evento de broadcasting después de enviar la notificación
     */
    public function sent($notifiable, $notification, $channel)
    {
        // Solo hacer broadcast para notificaciones de base de datos
        if ($channel === 'database') {
            $data = $notification->toDatabase($notifiable);
            broadcast(new NotificationSent($data, $notifiable));
        }
    }
}