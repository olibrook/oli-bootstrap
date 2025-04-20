import { useSession } from './SessionProvider';

const SignInPage = () => {
  return <div>TODO: Render a sign in page</div>;
};

export const AuthedPage = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();

  if (loading) return <div>Loading...</div>;

  if (session) {
    return <>{children}</>;
  } else {
    return (
      <div>
        <SignInPage />
      </div>
    );
  }
};
