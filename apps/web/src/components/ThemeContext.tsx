import { createContext, useContext, useEffect, useState } from 'react';

export type ValidTheme = 'oliBootstrap' | 'dracula';
const validThemes: ValidTheme[] = ['oliBootstrap', 'dracula'];

const isValidTheme = (s: string): s is ValidTheme => (validThemes as string[]).includes(s);

interface ThemeContextType {
  theme: ValidTheme;
  setTheme: (theme: ValidTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultTheme: ValidTheme = 'oliBootstrap';
  const [theme, _setTheme] = useState<ValidTheme>(defaultTheme);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const savedTheme = saved && isValidTheme(saved) ? saved : defaultTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    setTheme(savedTheme);
  }, []);

  const setTheme = (t: ValidTheme) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    _setTheme(t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
