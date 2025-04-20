import { type DemoJob1 } from '../schemas';

export const demoJob1 = async (job: DemoJob1) => {
  console.log('demoJob1 start');
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000));
  console.log(JSON.stringify(job, null, 2));
  return `demoJob1 completed at ${new Date().getTime()}`;
};
