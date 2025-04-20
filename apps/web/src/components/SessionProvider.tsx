import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: string | null;
  image: string;
  isSuperUser: boolean;
}

interface Session {
  sessionToken: string;
  userId: string;
  expires: string;
  user: User;
}

interface SessionContextType {
  session: Session | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data: Session = await res.json();
          setSession(data);
        }
      } catch (error) {
        console.error('Failed to fetch session', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return <SessionContext.Provider value={{ session, loading }}>{children}</SessionContext.Provider>;
};

export const useCurrentUser = () => {
  const { session, loading } = useSession();

  if (loading || !session) {
    throw new Error('useCurrentUser must be used inside an AuthedPage.');
  }

  return session.user;
};
