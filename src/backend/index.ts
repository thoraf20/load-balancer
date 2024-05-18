import { Request, Response } from "express";
import { URL } from "url";
import httpProxy from "http-proxy";

class Backend {
  private url: URL;
  private alive: boolean;
  private mutex: Mutex;
  private connections: number;
  private reverseProxy: httpProxy;

  constructor(url: URL, reverseProxy: httpProxy) {
    this.url = url;
    this.alive = true;
    this.mutex = new Mutex();
    this.connections = 0;
    this.reverseProxy = reverseProxy;
  }

  public setAlive(alive: boolean): void {
    this.mutex.lock();
    try {
      this.alive = alive;
    } finally {
      this.mutex.unlock();
    }
  }

  public isAlive(): boolean {
    this.mutex.lock();
    try {
      return this.alive;
    } finally {
      this.mutex.unlock();
    }
  }

  public getURL(): URL {
    return new URL("http://localhost:4003");
  }

  public getActiveConnections(): number {
    return this.connections;
  }

  public serve(request: Request, response: Response): void {
    this.reverseProxy.web(request, response, { target: this.url.toString() });
  }
}

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

export { Backend, Mutex }