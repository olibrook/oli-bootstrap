import { Queue, QueueEvents } from 'bullmq';
import { connection } from '../config';
import { type OliBootstrapJob } from '../schemas';

export const taskQueue = new Queue('task-queue', {
  connection,
});

export const queueEvents = new QueueEvents('task-queue', {
  connection,
});

export const addJob = (job: OliBootstrapJob) => {
  const { name, data } = job;
  return taskQueue.add(name, data);
};

// Add cron-style jobs here
//
// https://docs.bullmq.io/guide/job-schedulers
taskQueue.upsertJobScheduler(
  'some-scheduler-id',
  {
    every: 30_000,
  },
  {
    name: 'demo-2',
    data: {
      orgId: 'fake-org-id',
      bar: 'some-string',
    },
  }
);
