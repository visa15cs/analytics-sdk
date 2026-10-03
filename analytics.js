class AnalyticsSdk {
  constructor({
    batchSize = 3,
    flushInterval = 5000,
    maxRetries = 3,
    storageKey = "analytics-sdk",
  } = {}) {
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.maxRetries = maxRetries;
    this.storageKey = storageKey;
    this.queue = this.loadQueue();
    this.startTimer();
  }

  track(event, data = {}) {
    const analyticsEvent = {
      id: crypto.randomUUID(),
      event,
      data,
      timeStamp: Date.now(),
    };
    this.queue.push(analyticsEvent);
    this.saveQueue();
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    console.log("FLUSH CALLED");
    if (this.queue.length === 0) return;
    const batch = this.queue.slice(0, this.batchSize);
    try {
      await this.send(batch);
      this.queue = this.queue.slice(batch.length);
      this.saveQueue();
      console.log("Batch sent successfully");
    } catch {
      console.log("Failed to send ", batch);
      await this.retry(batch);
    }
  }

  async retry(batch) {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const delay = 1000 * 2 ** attempt;
      console.log(`Retry ${attempt + 1} in ${delay}ms`);
      await this.wait(delay);
      try {
        await this.send(batch);
        // Successful retry
        this.queue = this.queue.slice(batch.length);
        this.saveQueue();
        console.log("Retry successful");
        return;
      } catch (error) {
        console.error(`Retry ${attempt + 1} failed`);
      }
    }
    console.log("All retries failed. Events remain in queue.");
  }

  async send(batch) {
    console.log("SEND CALLED");
    // Demo API
    const response = await fetch("https://example.com/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }
  }

  startTimer() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  saveQueue() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
  }

  loadQueue() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return [];
    }
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

export default AnalyticsSdk;
