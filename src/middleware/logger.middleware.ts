import { Elysia } from 'elysia';

export const requestLogger = new Elysia({ name: 'request-logger' })
  .onRequest(({ request, store }) => {
    (store as any).startTime = performance.now();
  })
  .onAfterResponse(({ request, set, store }) => {
    const startTime = (store as any).startTime || performance.now();
    const duration = (performance.now() - startTime).toFixed(2);
    const method = request.method;
    const url = new URL(request.url).pathname;
    const numStatus = typeof set.status === 'number' ? set.status : Number(set.status) || 200;

    let statusColor = '\x1b[32m'; // green
    if (numStatus >= 400 && numStatus < 500) statusColor = '\x1b[33m'; // yellow
    if (numStatus >= 500) statusColor = '\x1b[31m'; // red

    const resetColor = '\x1b[0m';
    const dimColor = '\x1b[2m';

    console.log(
      `${dimColor}[${new Date().toISOString()}]${resetColor} ${method} ${url} ${statusColor}${numStatus}${resetColor} ${duration}ms`
    );
  });
