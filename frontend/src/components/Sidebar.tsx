type IconName = 'home';

type SidebarProps = {
  activeItem?: IconName;
};

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m3.5 10.5 8.5-7 8.5 7" />
      <path d="M5.5 9.5v10h13v-10" />
      <path d="M9.5 19.5v-5h5v5" />
    </svg>
  );
}

export function Sidebar({
  activeItem = 'home',
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span
          className="sidebar__logo"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </span>

        <span>
          <strong>
            CSV <em>Analyzer</em>
          </strong>

          <small>Data analysis tool</small>
        </span>
      </div>

      <nav
        className="sidebar__nav"
        aria-label="Navegação principal"
      >
        <a
          className={`sidebar__link ${
            activeItem === 'home' ? 'is-active' : ''
          }`}
          href="#top"
        >
          <HomeIcon />
          <span>Home</span>
        </a>
      </nav>

      <div className="sidebar__footer">
        <span
          className="sidebar__footer-mark"
          aria-hidden="true"
        >
          ///
        </span>

        <div>
          <strong>CSV Analyzer</strong>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}