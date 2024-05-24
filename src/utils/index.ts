

// Mutex class to handle locking mechanism
class Mutex {
  private locked: boolean;
  private waiting: (() => void)[];

  constructor() {
    this.locked = false;
    this.waiting = [];
  }

  async lock(): Promise<void> {
    if (this.locked) {
      return new Promise((resolve: any) => {
        this.waiting.push(resolve);
      }).then(() => this.lock());
    } else {
      this.locked = true;
    }
  }

  unlock(): void {
    if (this.waiting.length > 0) {
      const next = this.waiting.shift();
      if (next) {
        next();
      }
    } else {
      this.locked = false;
    }
  }
}

export { Mutex }