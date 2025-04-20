import { type DemoJob2 } from '../schemas';

export const demoJob2 = async (job: DemoJob2) => {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 5));
  console.log(JSON.stringify(job, null, 2));
  return `demoJob2 completed at ${new Date().getTime()}`;
};
