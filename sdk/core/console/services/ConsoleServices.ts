import * as http from 'http';
import { ConsoleRegistry } from '../ConsoleRegistry';
import { ConsoleMetricsCollector } from '../metrics/ConsoleMetricsCollector';
import { ConsoleLedger } from '../ledger/ConsoleLedger';

export class ConsoleServices {
  private server?: http.Server;

  constructor(
    private readonly registry: ConsoleRegistry,
    private readonly metrics: ConsoleMetricsCollector,
    private readonly ledger: ConsoleLedger
  ) {}

  public async startServer(port: number, apiPrefix: string = '/api'): Promise<void> {
    this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      // CORS setup
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const ip = req.socket.remoteAddress || 'unknown';

      if (req.method === 'GET' && url.pathname.startsWith(apiPrefix)) {
        this.metrics.recordApiRequest();
        this.ledger.recordAccess(ip, url.pathname);
        
        res.setHeader('Content-Type', 'application/json');

        try {
          switch (url.pathname) {
            case `${apiPrefix}/runtime`:
              res.writeHead(200);
              res.end(JSON.stringify(this.registry.getRuntimes()));
              break;
            case `${apiPrefix}/workflows`:
              res.writeHead(200);
              res.end(JSON.stringify(this.registry.getWorkflows()));
              break;
            case `${apiPrefix}/events`:
              res.writeHead(200);
              res.end(JSON.stringify(this.registry.getEvents()));
              break;
            case `${apiPrefix}/metrics`:
              res.writeHead(200);
              const sysMetrics = this.registry.getMetrics();
              const consoleMetrics = this.metrics.getMetrics();
              res.end(JSON.stringify({ ...sysMetrics, consoleMetrics: consoleMetrics }));
              break;
            case `${apiPrefix}/ledger`:
              res.writeHead(200);
              res.end(JSON.stringify(this.registry.getLedger()));
              break;
            case `${apiPrefix}/dependency`:
              res.writeHead(200);
              res.end(JSON.stringify(this.registry.getDependencyGraph()));
              break;
            default:
              res.writeHead(404);
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
          }
        } catch (err: any) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    return new Promise((resolve) => {
      this.server!.listen(port, () => {
        console.log(`[Console] HTTP API Server listening on port ${port}`);
        resolve();
      });
    });
  }

  public async stopServer(): Promise<void> {
    if (this.server) {
      return new Promise((resolve, reject) => {
        this.server!.close((err?: Error) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}
