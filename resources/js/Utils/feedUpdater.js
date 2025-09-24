import { router } from '@inertiajs/react';
import { apiClient } from './apiClient.js';

/**
 * Sistema de actualización automática del feed
 */
class FeedUpdater {
    constructor() {
        this.isActive = false;
        this.interval = null;
        this.updateInterval = 5000; // 5 segundos
        this.lastUpdate = Date.now();
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('🔄 Feed auto-updater iniciado');
        
        this.interval = setInterval(() => {
            this.checkForUpdates();
        }, this.updateInterval);
    }

    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        console.log('⏹️ Feed auto-updater detenido');
    }

    async checkForUpdates() {
        if (!document.hasFocus()) {
            // No actualizar si la pestaña no está activa
            return;
        }

        try {
            // Solo actualizar si estamos en el feed principal
            const currentPath = window.location.pathname;
            if (currentPath === '/' || currentPath.startsWith('/user/')) {
                // Recargar solo los datos de posts sin recargar toda la página
                router.reload({ 
                    only: ['posts'],
                    preserveScroll: true,
                    preserveState: true
                });
                
                this.lastUpdate = Date.now();
            }
        } catch (error) {
            console.error('Error actualizando feed:', error);
        }
    }

    // Actualizar inmediatamente después de una acción
    triggerImmediateUpdate() {
        setTimeout(() => {
            router.reload({ 
                only: ['posts'],
                preserveScroll: true,
                preserveState: true
            });
        }, 1000); // Esperar 1 segundo para que se procese la acción
    }
}

// Instancia global
export const feedUpdater = new FeedUpdater();
export default feedUpdater;