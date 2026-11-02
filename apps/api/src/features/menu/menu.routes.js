import { Router } from 'express';

export function createMenuRouter(menuService) {
  const router = Router();
  router.get('/', async (_request, response) => {
    response.json(await menuService.listMenu());
  });
  return router;
}
