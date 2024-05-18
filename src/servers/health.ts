import { Request, Response } from "express";
import { URL } from "url";
import * as http from "http";
import { ServerPool } from "./index.js";

  async function healthCheck(
    req: Request,
    res: Response,
    server: ServerPool
  ): Promise<void> {
    const aliveChannel: boolean[] = [];

    // Iteration over the available backends
    for (const backend of server.getBackends()) {
      // Defining a timeout for the health check
      const timeout = 10000; // 10 seconds

      // Checking on the backend URL
      await IsBackendAlive(timeout, aliveChannel, new URL(backend.url));

      // Set the alive status based on the result
      backend.isAlive = aliveChannel.pop() || false;
      // backend.setAlive(aliveChannel.pop() || false);
    }

    // res.status(200).send("Health check completed");
  };


  async function IsBackendAlive(
    timeout: number,
    aliveChannel: boolean[],
    url: URL
  ): Promise<void> {
    // Create a promise that resolves when the backend responds or times out
    const checkPromise = new Promise<boolean>((resolve) => {
      const requestTimeout = setTimeout(() => {
        // If the request times out, resolve with false
        resolve(false);
      }, timeout);

      const req = http.request(url, { method: "HEAD" }, (res) => {
        // If the backend responds, resolve with true
        clearTimeout(requestTimeout);
        resolve(true);
      });

      // Handle errors
      req.on("error", (err) => {
        clearTimeout(requestTimeout);
        console.error("Error checking backend:", err);
        resolve(false);
      });

      // End the request
      req.end();
    });

    // Wait for the promise to resolve and push the result to the aliveChannel
    const isAlive = await checkPromise;
    aliveChannel.push(isAlive);
  }

  export { healthCheck };
