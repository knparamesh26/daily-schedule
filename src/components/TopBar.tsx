import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppContext';

interface Props {
  search: string;
  onSearch: (v: string) => void;
}

export default function TopBar({ search, onSearch }: Props) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { settings } = useAppData();

  const displayName = settings.displayName || 'A';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-surface shadow-sm flex justify-between items-center w-full px-xl py-md">
      <div className="flex items-center px-md py-xs rounded-full w-96 border bg-surface-container border-outline-variant/50">
        <span className="material-symbols-outlined text-on-surface-variant text-icon-lg">search</span>
        <input
          className="bg-transparent border-none outline-none ml-sm w-full placeholder:text-on-surface-variant text-on-surface text-label-md"
          placeholder="Search tasks…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-lg">
        <button aria-label="Notifications" title="Notifications" className="relative text-on-surface-variant p-sm rounded-full hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </button>
        <button aria-label="Help" title="Help" className="text-on-surface-variant p-sm rounded-full hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">help_outline</span>
        </button>

        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setOpen(v => !v)}
            className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-xs font-bold hover:ring-2 hover:ring-secondary/50 transition-all duration-150"
          >
            {initial}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-sm w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
              <div className="flex items-center gap-md px-lg py-md border-b border-outline-variant">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-sm font-bold shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-label-md text-on-surface font-medium truncate">{displayName}</p>
                </div>
              </div>

              <div className="py-xs">
                <button
                  onClick={() => { setOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-md px-lg py-sm text-label-md text-on-surface hover:bg-surface-container transition-colors duration-150"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-icon-md">settings</span>
                  Settings
                </button>
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="w-full flex items-center gap-md px-lg py-sm text-label-md text-error hover:bg-error/5 transition-colors duration-150"
                >
                  <span className="material-symbols-outlined text-icon-md">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/tasks/new')}
          className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded hover:opacity-90 active:scale-95 transition-all duration-150 shadow-sm text-label-sm font-bold"
        >
          <span className="material-symbols-outlined text-icon-base">add</span>
          Add Task
        </button>
      </div>
    </header>
  );
}
