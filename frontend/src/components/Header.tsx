import type { Theme } from './ThemeToggle';
import { ThemeToggle } from './ThemeToggle';

type HeaderProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export function Header({
  theme,
  onThemeChange,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div
        className="topbar__mobile-brand"
        aria-label="CSV Analyzer"
      >
        <span
          className="topbar__mobile-mark"
          aria-hidden="true"
        >
          ///
        </span>

        <strong>
          CSV <em>Analyzer</em>
        </strong>
      </div>

      <div className="topbar__right">
        <ThemeToggle
          theme={theme}
          onChange={onThemeChange}
        />
      </div>
    </header>
  );
}