import express from 'express';
import { createMenuRepository } from './features/menu/menu.repository.js';
import { createMenuService } from './features/menu/menu.service.js';
import { createMenuRouter } from './features/menu/menu.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { createOrderRepository } from './features/orders/order.repository.js';
import { createOrderService } from './features/orders/order.service.js';
import { createOrderRouter } from './features/orders/order.routes.js';

// Compose dependencies here; services and repositories do not depend on Express.
export function createApp({
  menuRepository = createMenuRepository(),
  orderRepository = createOrderRepository(),
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/menu', createMenuRouter(createMenuService(menuRepository)));
  app.use('/api/orders', createOrderRouter(createOrderService({ menuRepository, orderRepository })));
  app.use((_request, response) => {
    response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  });
  app.use(errorHandler);
  return app;
}
