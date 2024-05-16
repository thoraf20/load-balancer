import express, { Response, Request} from 'express'
import httpProxy from 'http-proxy'
import cors from 'cors'
import helmet from 'helmet'

const app = express();
const proxy = httpProxy.createProxyServer();

const port = process.env.PORT

app.use(cors())
app.use(helmet());
app.disable("x-powered-by");

app.listen(port, () => {
  console.log(`Load balancer is running on port: ${port}`);
});