import { useState, useRef, useEffect } from 'react';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  onAddTask: () => void;
  showAddButton?: boolean;
  displayName?: string;
  userEmail?: string;
  onSettings?: () => void;
  onSignOut?: () => void;
}

export default function TopBar({
  search, onSearch, onAddTask,
  showAddButton = true,
  displayName = 'A',
  userEmail,
  onSettings,
  onSignOut,
}: Props) {
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
      <div className="flex items-center bg-surface-container px-md py-xs rounded-full w-96 border border-outline-variant/30">
        <span className="material-symbols-outlined text-on-surface-variant">search</span>
        <input
          className="bg-transparent border-none outline-none text-label-md w-full ml-sm placeholder:text-on-surface-variant text-on-surface"
          placeholder="Search tasks..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-lg">
        <button className="relative text-on-surface-variant hover:bg-surface-container-high p-sm rounded-full transition-all duration-150">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" />
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container-high p-sm rounded-full transition-all duration-150">
          <span className="material-symbols-outlined">help_outline</span>
        </button>

        {/* Avatar + popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setOpen(v => !v)}
            className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-xs font-bold hover:ring-2 hover:ring-secondary/50 transition-all duration-150"
          >
            {initial}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-sm w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
              {/* User info */}
              <div className="flex items-center gap-md px-lg py-md border-b border-outline-variant">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-sm font-bold shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-label-md text-on-surface font-medium truncate">{displayName}</p>
                  {userEmail && (
                    <p className="text-label-sm text-on-surface-variant truncate">{userEmail}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="py-xs">
                {onSettings && (
                  <button
                    onClick={() => { setOpen(false); onSettings(); }}
                    className="w-full flex items-center gap-md px-lg py-sm text-label-md text-on-surface hover:bg-surface-container transition-colors duration-150"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">settings</span>
                    Settings
                  </button>
                )}
                {onSignOut && (
                  <button
                    onClick={() => { setOpen(false); onSignOut(); }}
                    className="w-full flex items-center gap-md px-lg py-sm text-label-md text-error hover:bg-error/5 transition-colors duration-150"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {showAddButton && (
          <button
            onClick={onAddTask}
            className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded hover:opacity-90 active:scale-95 transition-all duration-150 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-label-md">Add Task</span>
          </button>
        )}
      </div>
    </header>
  );
}
