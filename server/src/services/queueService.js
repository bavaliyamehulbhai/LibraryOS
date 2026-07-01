/**
 * In-Memory Queue Mock (Mimicking Bull)
 * This avoids the need for a Redis server during local development while maintaining
 * the exact API and async processing benefits of a real queue.
 */
class MockQueue {
  constructor(name) {
    this.name = name;
    this.processors = new Map();
    // Use an array to store queued jobs
    this.jobs = [];
    this.processing = false;
  }

  process(name, concurrency, callback) {
    if (typeof concurrency === "function") {
      callback = concurrency;
    }
    this.processors.set(name, callback);
  }

  async add(name, data, opts = {}) {
    const job = {
      id: Math.random().toString(36).substring(7),
      name,
      data,
      opts,
      attemptsMade: 0,
    };

    if (opts.delay) {
      setTimeout(() => {
        this.jobs.push(job);
        this._startProcessing();
      }, opts.delay);
    } else {
      this.jobs.push(job);
      this._startProcessing();
    }

    return job;
  }

  async _startProcessing() {
    if (this.processing) return;
    this.processing = true;

    while (this.jobs.length > 0) {
      const job = this.jobs.shift();
      const processor = this.processors.get(job.name) || this.processors.get("*");

      if (processor) {
        try {
          await processor(job);
        } catch (err) {
          job.attemptsMade++;
          const maxAttempts = job.opts?.attempts || 1;
          if (job.attemptsMade < maxAttempts) {
            // Retry
            this.jobs.push(job);
          } else {
            console.error(`[Queue ${this.name}] Job ${job.name} failed after ${job.attemptsMade} attempts:`, err.message);
          }
        }
      } else {
        console.warn(`[Queue ${this.name}] No processor found for job ${job.name}`);
      }
    }

    this.processing = false;
  }
}

// Export a factory function that returns our mock instead of Bull
module.exports = (queueName) => {
  return new MockQueue(queueName);
};
