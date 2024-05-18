import express, { Response, Request} from 'express'
import httpProxy from 'http-proxy'
import cors from 'cors'
import helmet from 'helmet'
import { ServerPool } from './src/servers/index.js';
// import { healthCheck } from './src/servers/health.js';

const app = express();
const proxy = httpProxy.createProxyServer();

const port = process.env.PORT || 8080


app.use(cors())
app.use(helmet());
app.disable("x-powered-by");

app.use(async (request: Request, response: Response) => {
  const server = new ServerPool()

  // healthCheck(request, response, server);

  const currentServer = await server.getNextValidPeer();
  
  proxy.web(request, response, { target: currentServer?.url})
})

app.listen(port, () => {
  console.log(`Load balancer is running on port: ${port}`);
});