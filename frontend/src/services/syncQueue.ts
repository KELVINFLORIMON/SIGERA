import localforage from 'localforage';

export interface SyncRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  timestamp: number;
}

class SyncQueue {
  private queueKey = 'offline-sync-queue';
  private isProcessing = false;

  constructor() {
    localforage.config({
      name: 'SIGERA_Offline',
      storeName: 'sync_queue'
    });
  }

  // Genera un ID único para la petición
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Añade una petición a la cola
  async enqueueRequest(url: string, method: string, headers: Record<string, string>, body: any): Promise<void> {
    try {
      const queue: SyncRequest[] = await localforage.getItem(this.queueKey) || [];
      
      const newRequest: SyncRequest = {
        id: this.generateId(),
        url,
        method,
        headers,
        body,
        timestamp: Date.now()
      };
      
      queue.push(newRequest);
      await localforage.setItem(this.queueKey, queue);
      console.log(`[SyncQueue] Petición ${method} a ${url} encolada para sincronización offline.`);
    } catch (error) {
      console.error('[SyncQueue] Error al encolar petición:', error);
    }
  }

  // Procesa la cola enviando las peticiones pendientes
  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    if (!navigator.onLine) {
      console.log('[SyncQueue] Sin conexión. No se procesará la cola aún.');
      return;
    }

    this.isProcessing = true;
    
    try {
      const queue: SyncRequest[] = await localforage.getItem(this.queueKey) || [];
      
      if (queue.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`[SyncQueue] Procesando ${queue.length} peticiones encoladas...`);
      const newQueue = [...queue];

      for (const req of queue) {
        try {
          console.log(`[SyncQueue] Procesando petición ${req.id} (${req.method} ${req.url})`);
          
          // Re-intentar la petición
          const response = await fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
          });

          if (response.ok) {
            console.log(`[SyncQueue] Petición ${req.id} sincronizada correctamente.`);
            // Eliminar de la cola exitosamente procesados
            const index = newQueue.findIndex(r => r.id === req.id);
            if (index > -1) newQueue.splice(index, 1);
          } else {
            console.error(`[SyncQueue] Error al sincronizar ${req.id}. Status: ${response.status}`);
          }
        } catch (error) {
          console.error(`[SyncQueue] Error de red al intentar sincronizar ${req.id}:`, error);
          break; 
        }
      }

      // Guardar el estado actualizado de la cola
      await localforage.setItem(this.queueKey, newQueue);

    } catch (error) {
      console.error('[SyncQueue] Error procesando la cola:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const syncQueue = new SyncQueue();
