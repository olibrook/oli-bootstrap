import { createLazyFileRoute } from '@tanstack/react-router';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { type RouterOutput } from '@oliBootstrap/server/trpc';
import { LoadingIcon } from '@/icons';

type DemoTaskStatusIterable = RouterOutput['statusCheck']['demoTaskComplete'];
type AsyncIterableElement<T> = T extends AsyncIterable<infer U, unknown, unknown> ? U : never;
type DemoTaskStatus = AsyncIterableElement<DemoTaskStatusIterable>;

export const Route = createLazyFileRoute('/')({
  component: RouteComponent,
});

const TaskQueueDemo = ({ orgId }: { orgId: string }) => {
  const [inProgressJobId, setInProgressJobId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<DemoTaskStatus[]>([]);
  const enqueueDemoTask = trpc.statusCheck.enqueueDemoTask.useMutation();

  trpc.statusCheck.demoTaskComplete.useSubscription(
    { orgId },
    {
      onData: (st) => {
        setStatus([st, ...status]);
        if (st.jobId === inProgressJobId) {
          setInProgressJobId(undefined);
        }
      },
    }
  );
  const jobInProgress = Boolean(enqueueDemoTask.isPending || inProgressJobId);
  return (
    <div className="bg-base-100 border-1 border-base-content/10 overflow-hidden rounded-md shadow-lg">
      <div className="flex h-60 flex-col gap-2 p-2">
        <pre className="h-full shrink grow overflow-x-hidden overflow-y-scroll font-mono text-xs">{JSON.stringify(status, null, 2)}</pre>
        <div className="shrink0 grow-0">
          <button
            className="btn btn-primary w-40"
            disabled={jobInProgress}
            onClick={async () => {
              const jobId = await enqueueDemoTask.mutateAsync({ foo: 'This is the text', orgId });
              setInProgressJobId(jobId);
              console.log({ jobId });
            }}
          >
            {jobInProgress ? (
              <span className="animate-spin">
                <LoadingIcon />
              </span>
            ) : (
              'Enqueue'
            )}
          </button>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold">Task Queue Demo (orgId: {orgId})</h2>
        <div className="text-base-content/65">Should show updates for one Org ID only</div>
      </div>
    </div>
  );
};

const WebsocketDemo = () => {
  const [time, setTime] = useState('');
  trpc.statusCheck.onTimeUpdate.useSubscription(undefined, {
    onData: (t) => {
      setTime(t);
    },
  });
  return (
    <div className="bg-base-100 border-1 border-base-content/10 overflow-hidden rounded-md shadow-lg">
      <pre className="h-60 overflow-scroll p-2 font-mono text-xs">{JSON.stringify(time, null, 2)}</pre>
      <div className="p-4">
        <h2 className="text-lg font-semibold">Websocket Subscription</h2>
        <p className="text-base-content/65">Update every second</p>
      </div>
    </div>
  );
};

const UnauthenticatedRequestsDemo = () => {
  const { data: helloWorldData } = trpc.statusCheck.get.useQuery({ name: 'world' });
  return (
    <div className="bg-base-100 border-1 border-base-content/10 overflow-hidden rounded-md shadow-lg">
      <pre className="h-60 overflow-scroll p-2 font-mono text-xs">{JSON.stringify(helloWorldData, null, 2)}</pre>
      <div className="p-4">
        <h2 className="text-lg font-semibold">TRPC Hello</h2>
        <p className="text-base-content/65">Unauthenticated Requests</p>
      </div>
    </div>
  );
};

const AuthenticatedRequestsDemo = () => {
  const { data: me } = trpc.users.me.useQuery();
  return (
    <div className="bg-base-100 border-1 border-base-content/10 overflow-hidden rounded-md shadow-lg">
      <pre className="h-60 overflow-scroll p-2 font-mono text-xs">{JSON.stringify(me, null, 2)}</pre>
      <div className="p-4">
        <h2 className="text-lg font-semibold">Current User</h2>
        <p className="text-base-content/65">Authenticated Requests</p>
      </div>
    </div>
  );
};

const StatusGrid = () => {
  return (
    <div className="h-full w-full overflow-x-scroll overflow-y-scroll p-4">
      <div className="grid grid-cols-3 gap-6">
        <TaskQueueDemo orgId="fake-org-1" />
        <TaskQueueDemo orgId="fake-org-2" />
        <AuthenticatedRequestsDemo />
        <UnauthenticatedRequestsDemo />
        <WebsocketDemo />
      </div>
    </div>
  );
};

function RouteComponent() {
  return <StatusGrid />;
}
