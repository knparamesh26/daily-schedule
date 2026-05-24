import { useAppData } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { AppSettings, Priority } from '../types';
import { PRIORITY_ORDER, PRIORITY_LABELS } from '../types';

export default function Settings() {
  const { settings, handleSettingsChange } = useAppData();
  const { session, signOut } = useAuth();

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    handleSettingsChange({ ...settings, [key]: value });

  return (
    <div className="p-xl max-w-2xl mx-auto w-full">
      <div className="mb-xl">
        <h2 className="text-headline-xl text-on-surface font-bold">Settings</h2>
        <p className="text-body-md text-on-surface-variant mt-xs">Configure your workspace preferences and account.</p>
      </div>

      <div className="space-y-md">
        <Section title="Account" icon="account_circle">
          <Row label="Signed in as" isLast={!signOut}>
            <span className="text-body-sm text-on-surface-variant">{session?.user.email}</span>
          </Row>
          <Row label="Sign Out" hint="End your current session." isLast>
            <button
              onClick={signOut}
              className="flex items-center gap-sm px-md py-xs border border-error/30 text-error rounded text-label-sm hover:bg-error/5 transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-headline-sm">logout</span>
              Sign Out
            </button>
          </Row>
        </Section>

        <Section title="Profile" icon="person">
          <Row label="Display Name" hint="How TaskStream addresses you." isLast>
            <input
              className="border border-outline-variant rounded-sm px-sm py-xs text-label-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-52 bg-surface-container-lowest"
              value={settings.displayName}
              onChange={e => set('displayName', e.target.value)}
              placeholder="Your name"
            />
          </Row>
        </Section>

        <Section title="Preferences" icon="tune">
          <Row label="Default Priority" hint="Used when creating new tasks.">
            <div className="flex gap-xs flex-wrap justify-end">
              {PRIORITY_ORDER.map(p => {
                const active = settings.defaultPriority === p;
                return (
                  <button
                    key={p}
                    onClick={() => set('defaultPriority', p as Priority)}
                    className={`px-sm py-xs rounded-full text-label-sm border font-bold transition-all duration-150
                      ${active
                        ? 'bg-primary text-on-primary border-primary'
                        : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                      }`}
                  >
                    {PRIORITY_LABELS[p as Priority]}
                  </button>
                );
              })}
            </div>
          </Row>
          <Row label="Week Starts On" hint="First day of the calendar week." isLast>
            <div className="flex border border-outline-variant rounded p-0.75 bg-surface-container">
              {(['Sunday', 'Monday'] as const).map((label, i) => {
                const active = settings.weekStartsOn === i;
                return (
                  <button
                    key={label}
                    onClick={() => set('weekStartsOn', i as 0 | 1)}
                    className={`px-md py-xs rounded text-label-sm font-bold transition-all duration-150
                      ${active ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Row>
        </Section>

        <Section title="Appearance" icon="palette">
          <Row label="Dark Mode" hint="Inverts the workspace to a darker palette." isLast>
            <Toggle enabled={settings.darkMode} onChange={v => set('darkMode', v)} />
          </Row>
        </Section>

        <Section title="Notifications" icon="notifications">
          <Row label="Due Today Reminders" hint="Notify when tasks are due today.">
            <Toggle enabled={settings.dueTodayReminders ?? true} onChange={v => set('dueTodayReminders', v)} />
          </Row>
          <Row label="Weekly Digest" hint="A summary of progress every Monday morning." isLast>
            <Toggle enabled={settings.weeklyDigest ?? false} onChange={v => set('weeklyDigest', v)} />
          </Row>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="border border-outline-variant rounded-md overflow-hidden shadow-sm bg-surface-container-lowest">
      <div className="flex items-center gap-sm px-md py-xs border-b border-outline-variant bg-surface-container-low">
        <span className="material-symbols-outlined text-on-surface-variant text-icon-base">{icon}</span>
        <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({ label, hint, isLast, children }: { label: string; hint?: string; isLast?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center justify-between gap-lg px-md py-md ${!isLast ? 'border-b border-outline-variant/50' : ''}`}>
      <div className="min-w-0">
        <p className="text-label-md text-on-surface font-bold">{label}</p>
        {hint && <p className="text-label-sm text-on-surface-variant mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-center justify-end shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={`relative inline-flex items-center h-5.5 w-10 rounded-full transition-colors duration-200 focus:outline-none
        ${enabled ? 'bg-primary' : 'bg-surface-container-high'}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${enabled ? 'translate-x-5.5' : 'translate-x-0.75'}`}
      />
    </button>
  );
}
