// src/lib/server/context.ts
import { initTRPC } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createSvelteKitContext = (locals: App.Locals) => (_: FetchCreateContextFnOptions) =>
	locals;

const t = initTRPC.context<ReturnType<typeof createSvelteKitContext>>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

