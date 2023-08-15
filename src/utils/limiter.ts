class RateLimiter {
  private limit: number;
  private interval: number;
  private calls: number[];

  constructor(limit: number, interval: number) {
    this.limit = limit;
    this.interval = interval;
    this.calls = [];
  }

  canCall(): boolean {
    const now = Date.now();
    this.calls = this.calls.filter(callTime => now - callTime <= this.interval);
    if (this.calls.length < this.limit) {
      this.calls.push(now);
      return true;
    }
    return false;
  }
}

export default RateLimiter;