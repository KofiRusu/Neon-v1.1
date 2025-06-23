import { router } from '../trpc/trpc';
import { contentRouter } from './content';
import { seoRouter } from './seo';

export const appRouter = router({
  content: contentRouter,
  seo: seoRouter,
});

export type AppRouter = typeof appRouter;