import { ErrorIcon } from '@/icons';

export const GenericFullscreenError = ({ title, msg }: { title: React.ReactNode; msg: React.ReactNode }) => {
  return (
    <div className="bg-base-200 absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
      <div className={`text-base-content/65 flex items-center justify-center`} aria-label="Loading" role="status">
        <div className="card bg-base-100 card-xl w-96 shadow-sm">
          <div className="card-body">
            <h2 className="card-title flex-row items-center">
              <ErrorIcon />
              {title}
            </h2>
            <div>{msg}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
