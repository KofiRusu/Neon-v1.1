import { router } from '../trpc/trpc';
import { contentRouter } from './content';
import { seoRouter } from './seo';
import { brandVoiceRouter } from './brand-voice';
import { trainingRouter } from './training';
import { assetsRouter } from './assets';
import { settingsRouter } from './settings';

export const appRouter = router({
  content: contentRouter,
  seo: seoRouter,
  brandVoice: brandVoiceRouter,
  training: trainingRouter,
  assets: assetsRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;