import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import type { Task } from '../types';
import { PRIORITY_STYLES } from '../types';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MAX_TRACKS = 2;
const DATE_ROW_H = 32;
const EVENT_H = 20;
const EVENT_GAP = 4;
const MORE_ROW_H = 18;
const CELL_H = DATE_ROW_H + MAX_TRACKS * (EVENT_H + EVENT_GAP) + MORE_ROW_H + 6;

interface CellData {
  day: number;
  currentMonth: boolean;
  date: string;
}

interface EventSlot {
  task: Task;
  startCol: number;
  endCol: number;
  track: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

function toDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getSlotsForWeek(week: CellData[], tasks: Task[]): EventSlot[] {
  const weekStart = toDate(week[0].date);
  const weekEnd = toDate(week[6].date);
  const MS_DAY = 86_400_000;

  const candidates = tasks
    .filter(t => t.dueDate)
    .map(t => ({
      task: t,
      start: t.startDate ? toDate(t.startDate) : toDate(t.dueDate!),
      end: toDate(t.dueDate!),
    }))
    .filter(({ start, end }) => start <= weekEnd && end >= weekStart)
    .sort((a, b) => {
      const ds = a.start.getTime() - b.start.getTime();
      if (ds !== 0) return ds;
      return (b.end.getTime() - b.start.getTime()) - (a.end.getTime() - a.start.getTime());
    });

  const trackOccupied: Array<Array<[number, number]>> = [];

  return candidates.map(({ task, start, end }) => {
    const startCol = Math.max(0, Math.round((start.getTime() - weekStart.getTime()) / MS_DAY));
    const endCol = Math.min(6, Math.round((end.getTime() - weekStart.getTime()) / MS_DAY));
    const continuesBefore = start < weekStart;
    const continuesAfter = end > weekEnd;

    let track = 0;
    while (true) {
      if (!trackOccupied[track]) trackOccupied[track] = [];
      const blocked = trackOccupied[track].some(([s, e]) => !(endCol < s || startCol > e));
      if (!blocked) {
        trackOccupied[track].push([startCol, endCol]);
        break;
      }
      track++;
    }

    return { task, startCol, endCol, track, continuesBefore, continuesAfter };
  });
}

function eventBarStyle(task: Task) {
  if (task.priority === 'critical' || task.priority === 'high') {
    return { bg: 'bg-error/15 hover:bg-error/25', text: 'text-error', borderColor: '#ba1a1a' };
  }
  if (task.priority === 'medium') {
    return { bg: 'bg-primary/10 hover:bg-primary/20', text: 'text-primary', borderColor: 'rgb(var(--c-primary))' };
  }
  return { bg: 'bg-surface-container hover:bg-surface-container-high', text: 'text-on-surface-variant', borderColor: 'rgb(var(--c-outline-var))' };
}

export default function Calendar() {
  const navigate = useNavigate();
  const { tasks, settings } = useAppData();
  const weekStartsOn = (settings.weekStartsOn ?? 0) as 0 | 1;

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const rotatedDayNames = [...DAY_NAMES.slice(weekStartsOn), ...DAY_NAMES.slice(0, weekStartsOn)];

  const rawFirstDow = new Date(year, month, 1).getDay();
  const firstDow = (rawFirstDow - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CellData[] = useMemo(() => {
    const out: CellData[] = [];
    const pad = (n: number) => String(n).padStart(2, '0');

    for (let i = firstDow - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      out.push({ day: d, currentMonth: false, date: `${py}-${pad(pm + 1)}-${pad(d)}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ day: d, currentMonth: true, date: `${year}-${pad(month + 1)}-${pad(d)}` });
    }
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    for (let d = 1; out.length < 42; d++) {
      out.push({ day: d, currentMonth: false, date: `${ny}-${pad(nm + 1)}-${pad(d)}` });
    }
    return out;
  }, [year, month, firstDow, daysInMonth, daysInPrevMonth]);

  const weeks = useMemo(() => {
    const out: CellData[][] = [];
    for (let i = 0; i < 42; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [cells]);

  const scheduledCount = useMemo(() =>
    tasks.filter(t => {
      if (!t.dueDate) return false;
      const d = toDate(t.dueDate);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length,
  [tasks, year, month]);

  const todayStr = (() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  })();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  return (
    <div className="p-xl max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h2 className="text-page-title text-on-surface">{MONTH_NAMES[month]} {year}</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {scheduledCount === 0
              ? 'No tasks due this month.'
              : `${scheduledCount} task${scheduledCount !== 1 ? 's' : ''} due this month.`}
          </p>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex bg-surface-container border border-outline-variant rounded-lg p-xs">
            <button onClick={prevMonth} className="p-sm hover:bg-surface-container-high rounded transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={goToday} className="px-md py-xs text-label-md hover:bg-surface-container-high rounded transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-sm hover:bg-surface-container-high rounded transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <button
            onClick={() => navigate('/tasks/new')}
            className="flex items-center gap-sm bg-primary text-on-primary px-lg py-md rounded-lg text-label-md active:scale-95 transition-transform hover:opacity-90"
          >
            <span className="material-symbols-outlined text-icon-md">add</span>
            Create Task
          </button>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low">
          {rotatedDayNames.map(d => (
            <div key={d} className="py-md text-center text-label-md text-on-surface-variant">{d}</div>
          ))}
        </div>

        {weeks.map((week, wi) => {
          const slots = getSlotsForWeek(week, tasks);
          const isLastWeek = wi === weeks.length - 1;

          const hiddenByCol = Array(7).fill(0) as number[];
          slots.forEach(s => {
            if (s.track >= MAX_TRACKS) {
              for (let c = s.startCol; c <= s.endCol; c++) {
                hiddenByCol[c]++;
              }
            }
          });

          return (
            <div
              key={wi}
              className={`relative select-none ${!isLastWeek ? 'border-b border-outline-variant' : ''}`}
              style={{ height: CELL_H }}
            >
              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                {week.map((cell, ci) => {
                  const isToday = cell.date === todayStr;
                  return (
                    <div
                      key={ci}
                      className={`h-full ${ci < 6 ? 'border-r border-outline-variant' : ''}
                        ${!cell.currentMonth
                          ? 'bg-surface-container-lowest opacity-40'
                          : isToday
                            ? 'bg-surface-container-low'
                            : 'bg-surface-container-lowest'
                        }`}
                    />
                  );
                })}
              </div>

              <div className="absolute inset-x-0 top-0 grid grid-cols-7 pointer-events-none" style={{ height: DATE_ROW_H }}>
                {week.map((cell, ci) => {
                  const isToday = cell.date === todayStr;
                  return (
                    <div key={ci} className="flex items-center px-sm pt-1.5">
                      <span className={`text-label-sm flex items-center justify-center w-5.5 h-5.5
                        ${isToday
                          ? 'bg-primary text-on-primary rounded-full font-bold'
                          : 'text-on-surface-variant'
                        }`}
                      >
                        {cell.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              {slots
                .filter(s => s.track < MAX_TRACKS)
                .map((slot, si) => {
                  const style = eventBarStyle(slot.task);
                  const colW = 100 / 7;
                  const leftPct = slot.startCol * colW;
                  const widthPct = (slot.endCol - slot.startCol + 1) * colW;
                  const topPx = DATE_ROW_H + slot.track * (EVENT_H + EVENT_GAP);
                  const r = slot.continuesBefore && slot.continuesAfter ? '0px'
                    : slot.continuesBefore ? '0 4px 4px 0'
                    : slot.continuesAfter ? '4px 0 0 4px'
                    : '4px';

                  return (
                    <button
                      key={si}
                      title={slot.task.name}
                      onClick={() => navigate(`/tasks/${slot.task.id}`)}
                      className={`absolute truncate text-label-xs font-semibold px-xs flex items-center transition-colors ${style.bg} ${style.text}`}
                      style={{
                        left: `calc(${leftPct}% + ${slot.continuesBefore ? 0 : 3}px)`,
                        width: `calc(${widthPct}% - ${(slot.continuesBefore ? 0 : 3) + (slot.continuesAfter ? 0 : 3)}px)`,
                        top: topPx,
                        height: EVENT_H,
                        borderLeft: `2px solid ${style.borderColor}`,
                        borderRadius: r,
                        zIndex: 10,
                      }}
                    >
                      {slot.task.name}
                    </button>
                  );
                })}

              {hiddenByCol.map((hidden, ci) =>
                hidden > 0 ? (
                  <button
                    key={ci}
                    aria-label={`Show ${hidden} more tasks`}
                    className="absolute text-label-xs text-on-surface-variant font-semibold hover:text-primary px-sm text-left"
                    style={{
                      left: `calc(${(ci / 7) * 100}%)`,
                      width: `calc(100% / 7)`,
                      top: DATE_ROW_H + MAX_TRACKS * (EVENT_H + EVENT_GAP),
                      zIndex: 11,
                    }}
                  >
                    +{hidden} more
                  </button>
                ) : null
              )}
            </div>
          );
        })}
      </div>

      {tasks.filter(t => !t.dueDate).length > 0 && (
        <div className="mt-xl">
          <h3 className="text-headline-sm mb-md text-on-surface-variant">Unscheduled Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {tasks.filter(t => !t.dueDate).map(task => (
              <button
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="text-left bg-surface-container-lowest border border-outline-variant rounded-lg p-md hover:shadow-md transition-all duration-150"
              >
                <span className={`text-label-sm px-sm py-xs rounded uppercase ${PRIORITY_STYLES[task.priority].bg} ${PRIORITY_STYLES[task.priority].text}`}>
                  {task.priority}
                </span>
                <p className="text-label-md text-primary mt-sm">{task.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
