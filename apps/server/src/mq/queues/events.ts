import { EventEmitter } from 'events';

import { queueEvents, taskQueue } from '.';
import { BaseJob } from '../schemas';

export type JobCompleteEvent = {
  jobId: string;
  returnvalue: string;
  prev?: string;
};

interface TypedEventEmitter {
  on(event: `job:${string}`, listener: (event: JobCompleteEvent) => void): this;
  on(event: `org:${string}`, listener: (event: JobCompleteEvent) => void): this;

  once(event: `job:${string}`, listener: (event: JobCompleteEvent) => void): this;
  once(event: `org:${string}`, listener: (event: JobCompleteEvent) => void): this;

  emit(event: `job:${string}`, data: JobCompleteEvent): boolean;
  emit(event: `org:${string}`, data: JobCompleteEvent): boolean;

  off(event: `job:${string}`, listener: (event: JobCompleteEvent) => void): this;
  off(event: `org:${string}`, listener: (event: JobCompleteEvent) => void): this;
}

/**
 * An event emitter that listens for all completion events on BullMQ and lets
 * you subscribe for a specific job id, or to all events for a given org id.
 *
 * To subscribe to events for an OrgId, the Job payload must have included
 * an orgId (eg. by extending the BaseJob schema).
 */
export const completionEvents = new EventEmitter() as TypedEventEmitter;

queueEvents.on('completed', async (event: JobCompleteEvent) => {
  // Emit a job-specific event
  completionEvents.emit(`job:${event.jobId}`, event);

  const job = await taskQueue.getJob(event.jobId);
  const { success, data } = BaseJob.safeParse(job.data);
  if (success) {
    // Emit an org-specific event, so that folks can subscribe
    // for task-completions for the whole org
    completionEvents.emit(`org:${data.orgId}`, event);
  }
});
