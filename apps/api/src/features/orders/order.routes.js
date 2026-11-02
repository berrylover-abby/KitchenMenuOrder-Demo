import { Router } from 'express';

export function createOrderRouter(orderService) {
  const router = Router();
  router.get('/:id/status', async (request, response) => {
    response.set('Cache-Control', 'no-store');
    response.json(await orderService.getStatus(request.params.id));
  });
  router.patch('/:id/status', async (request, response) => {
    response.json(await orderService.updateStatus(request.params.id, request.body));
  });
  router.get('/', async (_request, response) => {
    response.set('Cache-Control', 'no-store');
    response.json({ orders: await orderService.listOrders() });
  });
  router.post('/', async (request, response) => {
    const order = await orderService.createOrder(request.body);
    response.status(201).json(order);
  });
  return router;
}
