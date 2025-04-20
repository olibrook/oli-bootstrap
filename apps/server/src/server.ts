import { Command, Option } from 'commander';
import { main as workerMain } from './mq/workers/worker-main';
import { main as expressMain } from './express-main';

const processTypes = ['web', 'worker'] as const;
type ProcessType = (typeof processTypes)[number];

export async function main() {
  const program = new Command();

  program
    .name('oliBootstrap')
    .description('OliBootstrap application server')
    .addOption(
      new Option('-t, --type <type>', 'process type to run').choices(processTypes).env('PROCESS_TYPE').makeOptionMandatory().default('web')
    )
    .action(async ({ type }: { type: ProcessType }) => {
      const innner = async (): Promise<number> => {
        switch (type) {
          case 'web':
            await expressMain();
            return 0;
          case 'worker':
            await workerMain();
            return 0;
        }
      };
      void innner();
    });

  await program.parseAsync(process.argv);
}

void main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
