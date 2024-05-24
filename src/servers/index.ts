import httpProxy from "http-proxy";
import { Backend, Mutex } from "../backend/index.js";

const registerServers = [
  {
    url: "http://localhost:4004",
    isAlive: true,
  },
  {
    url: "http://localhost:4005",
    isAlive: true,
  },
  {
    url: "http://localhost:4003",
    isAlive: false,
  },
];


interface Server {
  url: string;
  isAlive: boolean;
  current?: number;
  reverseProxy?: httpProxy;
}

interface RoundRobinServerPool {
  server: Server[];
  current: number;
}


export class ServerPool {
  private backends: Server[];
  private current: number;
  private mutex: Mutex;
  private connections: number;

  constructor() {
    this.backends = registerServers;
    this.current = -1;
    this.mutex = new Mutex();
    this.connections = 0;
  }

  public getBackends(): Server[] {
    return this.backends;
  }

  public addBackend(backend: Server): void {
    this.backends.push(backend);
  }

  public getServerPoolSize(): number {
    return this.backends.length;
  }

  public getActiveConnections(): number {
    return this.connections;
  }

  // roundRobin method
  private async rotate(): Promise<Server> {
    await this.mutex.lock();
    try {
      this.current = (this.current + 1) % this.getServerPoolSize();
      return registerServers[this.current];
    } finally {
      this.mutex.unlock();
    }
  }

  public async getNextValidPeer(): Promise<Server | null> {
    for (let i = 0; i < this.getServerPoolSize(); i++) {
      const nextAvailableServer = await this.rotate();
      if (nextAvailableServer.isAlive) {
        return nextAvailableServer;
      }
    }
    return null;
  }
}
