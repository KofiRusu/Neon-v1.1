import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { prisma } from '@neonhub/data-model';
import { logger } from '@neonhub/utils';
import superjson from 'superjson';

type User = {
  id: string;
  email: string;
  name?: string;
};

type Session = {
  user: User;
  expires: string;
};

export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts;

  // Get the session from the request header or cookie
  // For now, we'll create a mock session for development
  const session: Session | null = process.env.NODE_ENV === 'development' 
    ? {
        user: {
          id: 'dev-user-1',
          email: 'dev@neonhub.com',
          name: 'Development User'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    : null; // TODO: Implement proper session management with NextAuth or similar

  return {
    req,
    res,
    prisma,
    session,
    logger,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
            ? error.cause.message
            : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      // infers the `session` as non-nullable
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

// Logging middleware
export const loggerMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  ctx.logger.info(`${type} ${path} - ${durationMs}ms`);
  
  return result;
});

export const loggingProcedure = publicProcedure.use(loggerMiddleware);
export const protectedLoggingProcedure = protectedProcedure.use(loggerMiddleware);