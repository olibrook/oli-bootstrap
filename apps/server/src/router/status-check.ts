import { z } from 'zod';
import { publicProcedure, router } from '@oliBootstrap/server/trpc';
import { addJob } from '../mq/queues';
import { Readable } from 'stream';
import { completionEvents, type JobCompleteEvent } from '../mq/queues/events';

export const statusCheckRouter = router({
  get: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ input }) => {
      return { success: true, message: `Hello ${input.name}!` };
    }),

  onTimeUpdate: publicProcedure.subscription(async function* () {
    console.log('Time update subscription started');
    while (true) {
      yield new Date().toISOString();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }),

  enqueueDemoTask: publicProcedure.input(z.object({ foo: z.string(), orgId: z.string() })).mutation(async ({ input }) => {
    const t = await addJob({ name: 'demo-1', data: { ...input } });
    return t.id;
  }),

  demoTaskComplete: publicProcedure.input(z.object({ orgId: z.string() })).subscription(async function* ({ input }) {
    const { orgId } = input;

    const stream = new Readable({
      objectMode: true,
      read() {}, // No-op because we push manually
    });

    const onEvent = (event: JobCompleteEvent) => {
      stream.push(event);
    };

    const channel = `org:${orgId}` as const;

    completionEvents.on(channel, onEvent);

    stream.on('end', () => {
      completionEvents.off(channel, onEvent);
    });

    try {
      for await (const event of stream as AsyncIterable<JobCompleteEvent>) {
        yield event;
      }
    } finally {
      stream.push(null); // End the stream
      completionEvents.off(channel, onEvent);
    }
  }),
});
