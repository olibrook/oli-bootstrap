import { MoonIcon, SunIcon } from '../icons';
import { useTheme } from './ThemeContext';

export const ThemePicker = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button className="btn btn-ghost" onClick={() => (theme === 'dracula' ? setTheme('oliBootstrap') : setTheme('dracula'))}>
      <div className="swap swap-rotate">
        <MoonIcon className={theme === 'dracula' ? 'swap-off' : 'swap-on'} size={18} />
        <SunIcon className={theme === 'oliBootstrap' ? 'swap-off' : 'swap-on'} size={18} />
      </div>
    </button>
  );
};
