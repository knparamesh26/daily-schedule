import { useState } from 'react';
import type { HistoryEntry, HistoryAction } from '../types';
import { HISTORY_META } from '../types';

interface Props {
  history: HistoryEntry[];
  onViewTask: (id: string) => void;
}

type Filter = 'all' | HistoryAction;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'created',   label: 'Created' },
  { key: 'updated',   label: 'Updated' },
  { key: 'completed', label: 'Completed' },
  { key: 'deleted',   label: 'Deleted' },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const entryDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (entryDay.getTime() === today.getTime()) return 'Today';
  if (entryDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function History({ history, onViewTask }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = history.filter(e => filter === 'all' || e.action === filter);

  const groups: { label: string; entries: HistoryEntry[] }[] = [];
  for (const entry of filtered) {
    const label = groupLabel(entry.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }

  return (
    <div className="p-xl max-w-4xl mx-auto w-full">
      <div className="mb-xl">
        <h2 className="text-headline-lg text-primary">History</h2>
        <p className="text-body-md text-on-surface-variant mt-xs">
          A log of all task activity across your workspace.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-xs mb-xl bg-surface-container p-xs rounded-lg w-fit">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-lg py-sm rounded text-label-md transition-colors duration-150
              ${filter === f.key
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-margin">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">history</span>
          <p className="text-body-md text-on-surface-variant mt-md">No activity yet.</p>
          <p className="text-label-md text-on-surface-variant/60 mt-xs">
            Actions like creating, editing, and completing tasks will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-xl">
          {groups.map(group => (
            <div key={group.label}>
              <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-md px-xs">
                {group.label}
              </h3>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                {group.entries.map((entry, i) => {
                  const meta = HISTORY_META[entry.action];
                  const isLast = i === group.entries.length - 1;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-md p-md hover:bg-surface-container-low transition-colors
                        ${!isLast ? 'border-b border-outline-variant/50' : ''}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                        ${entry.action === 'created'   ? 'bg-secondary/10' :
                          entry.action === 'completed' ? 'bg-green-500/10' :
                          entry.action === 'deleted'   ? 'bg-error/10' :
                          'bg-surface-container-high'}`}
                      >
                        <span className={`material-symbols-outlined text-[18px] ${meta.color}`}>
                          {meta.icon}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-label-md text-on-surface">
                          <span className="font-semibold">{meta.label}:</span>{' '}
                          {entry.action === 'deleted' ? (
                            <span className="text-on-surface-variant line-through">{entry.taskName}</span>
                          ) : (
                            <button
                              onClick={() => onViewTask(entry.taskId)}
                              className="text-primary hover:underline"
                            >
                              {entry.taskName}
                            </button>
                          )}
                        </p>
                      </div>

                      <span className="text-label-sm text-on-surface-variant shrink-0">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
