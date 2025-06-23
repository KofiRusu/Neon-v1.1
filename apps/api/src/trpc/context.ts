import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export function createContext({ req, res }: CreateExpressContextOptions) {
  return {
    req,
    res,
    // Add user context here when authentication is implemented
    user: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;