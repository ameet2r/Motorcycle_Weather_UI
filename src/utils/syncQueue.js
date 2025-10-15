/**
 * Background sync queue for non-blocking backend operations
 * Handles retries with exponential backoff for failed operations
 */
class SyncQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  /**
   * Add an operation to the queue for background processing
   * @param {Function} operation - Async function to execute
   * @param {number} retries - Maximum number of retry attempts (default: 3)
   */
  async enqueue(operation, retries = 3) {
    this.queue.push({
      operation,
      retries,
      attempt: 0,
      enqueuedAt: Date.now()
    });

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process queued operations with retry logic
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];

      try {
        await item.operation();
        // Success - remove from queue
        this.queue.shift();

        if (process.env.NODE_ENV === 'development') {
          const duration = Date.now() - item.enqueuedAt;
          console.log(`[SyncQueue] Operation completed successfully (${duration}ms)`);
        }
      } catch (error) {
        item.attempt++;

        if (item.attempt >= item.retries) {
          // Max retries reached - remove from queue
          console.error('[SyncQueue] Operation failed after max retries:', error);
          this.queue.shift();

          // Optional: Could store failed operations for manual retry later
          // this.storeFailedOperation(item);
        } else {
          // Retry with exponential backoff
          const backoffMs = Math.pow(2, item.attempt) * 1000;
          console.warn(`[SyncQueue] Operation failed (attempt ${item.attempt}/${item.retries}), retrying in ${backoffMs}ms...`);

          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    this.processing = false;
  }

  /**
   * Get current queue status
   * @returns {Object} Queue statistics
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      operations: this.queue.map(item => ({
        attempt: item.attempt,
        maxRetries: item.retries,
        enqueuedAt: item.enqueuedAt
      }))
    };
  }

  /**
   * Clear the queue (use with caution)
   */
  clear() {
    this.queue = [];
    console.log('[SyncQueue] Queue cleared');
  }
}

// Export singleton instance
export const syncQueue = new SyncQueue();

// Optional: Expose queue status for debugging
if (typeof window !== 'undefined') {
  window.getSyncQueueStatus = () => syncQueue.getStatus();
}
