export type Theme = 'light' | 'dark';

type ThemeToggleProps = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="3.5" />

      <path d="M12 2.5v2" />
      <path d="M12 19.5v2" />
      <path d="M4.4 4.4l1.4 1.4" />
      <path d="M18.2 18.2l1.4 1.4" />
      <path d="M2.5 12h2" />
      <path d="M19.5 12h2" />
      <path d="M4.4 19.6l1.4-1.4" />
      <path d="M18.2 5.8l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19.5 15.8A8 8 0 0 1 8.2 4.5 8.5 8.5 0 1 0 19.5 15.8Z" />
    </svg>
  );
}

export function ThemeToggle({
  theme,
  onChange,
}: ThemeToggleProps) {
  return (
    <div
      className="theme-toggle"
      role="group"
      aria-label="Tema da interface"
    >
      <button
        type="button"
        className={theme === 'light' ? 'is-active' : ''}
        onClick={() => onChange('light')}
        aria-pressed={theme === 'light'}
      >
        <SunIcon />
        <span>Claro</span>
      </button>

      <button
        type="button"
        className={theme === 'dark' ? 'is-active' : ''}
        onClick={() => onChange('dark')}
        aria-pressed={theme === 'dark'}
      >
        <MoonIcon />
        <span>Escuro</span>
      </button>
    </div>
  );
}