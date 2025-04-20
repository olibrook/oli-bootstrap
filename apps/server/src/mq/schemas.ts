import { z } from 'zod';

export const BaseJob = z.object({
  orgId: z.string(),
});

const DemoJob1Schema = z.object({
  name: z.literal('demo-1'),
  data: BaseJob.extend({
    foo: z.string(),
  }),
});

export type DemoJob1 = z.infer<typeof DemoJob1Schema>;

const DemoJob2Schema = z.object({
  name: z.literal('demo-2'),
  data: BaseJob.extend({
    bar: z.string(),
  }),
});

export type DemoJob2 = z.infer<typeof DemoJob2Schema>;

export const OliBootstrapJobSchema = z.discriminatedUnion('name', [DemoJob1Schema, DemoJob2Schema]);

export type OliBootstrapJob = z.infer<typeof OliBootstrapJobSchema>;
