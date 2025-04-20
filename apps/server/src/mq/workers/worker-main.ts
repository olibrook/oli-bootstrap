import { Worker, type Job } from 'bullmq';
import { connection } from '../config';
import { OliBootstrapJobSchema } from '../schemas';
import { demoJob1 } from './demo-job-1';
import { demoJob2 } from './demo-job-2';

const taskProcessor = async (job: Job) => {
  const exhaustivenessCheck = (x: never): never => {
    throw new Error(`Unhandled job name: ${x}`);
  };

  console.log(JSON.stringify(job, null, 2));

  const parsed = OliBootstrapJobSchema.parse(job);
  switch (parsed.name) {
    case 'demo-1':
      return demoJob1(parsed);
    case 'demo-2':
      return demoJob2(parsed);
    default:
      // If we land here, we've missed a case.
      return exhaustivenessCheck(parsed);
  }
};

const handleWorkerEvents = (worker: Worker, name: string) => {
  worker.on('completed', (job: Job) => console.log(`${name}: Job "${job.id}" completed`));
  worker.on('failed', (job, err) => console.error(`${name}: Job "${job?.id ?? 'Unknown'}" failed: ${err.message}`));
};

export async function main() {
  const taskWorker = new Worker('task-queue', taskProcessor, { connection });

  handleWorkerEvents(taskWorker, 'task-queue');

  console.log('Workers started and processing jobs!');

  process.on('SIGINT', async () => {
    await Promise.all([taskWorker.close()]);
    process.exit(0);
  });

  return { taskWorker };
}
