import type { AppSettings, Priority } from '../types';
import { PRIORITY_ORDER, PRIORITY_LABELS } from '../types';

interface Props {
  settings: AppSettings;
  onChange: (s: AppSettings) => void;
  userEmail?: string;
  onSignOut?: () => void;
}

export default function Settings({ settings, onChange, userEmail, onSignOut }: Props) {
  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="p-lg max-w-2xl mx-auto w-full">
      <h2 className="text-headline-lg text-on-surface font-semibold mb-lg">Settings</h2>

      <div className="space-y-md">
        {/* Account */}
        {(userEmail || onSignOut) && (
          <Section title="Account" icon="account_circle">
            {userEmail && (
              <Row label="Signed in as">
                <span className="text-label-sm text-on-surface-variant">{userEmail}</span>
              </Row>
            )}
            {onSignOut && (
              <Row label="Sign Out">
                <button
                  onClick={onSignOut}
                  className="px-md py-xs border border-error/30 text-error rounded text-label-sm hover:bg-error/5 transition-colors duration-150"
                >
                  Sign Out
                </button>
              </Row>
            )}
          </Section>
        )}

        {/* Profile */}
        <Section title="Profile" icon="person">
          <Row label="Display Name">
            <input
              className="bg-surface-container border border-outline-variant rounded px-sm py-xs text-label-sm text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all w-48"
              value={settings.displayName}
              onChange={e => set('displayName', e.target.value)}
              placeholder="Your name"
            />
          </Row>
        </Section>

        {/* Preferences */}
        <Section title="Preferences" icon="tune">
          <Row label="Default Priority">
            <div className="flex gap-xs flex-wrap justify-end">
              {PRIORITY_ORDER.map(p => (
                <button
                  key={p}
                  onClick={() => set('defaultPriority', p as Priority)}
                  className={`px-sm py-xs rounded-full text-label-xs border transition-all duration-150
                    ${settings.defaultPriority === p
                      ? 'bg-primary text-on-primary border-primary'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                >
                  {PRIORITY_LABELS[p as Priority]}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Week Starts On">
            <div className="flex bg-surface-container border border-outline-variant rounded p-[3px]">
              {(['Sunday', 'Monday'] as const).map((label, i) => (
                <button
                  key={label}
                  onClick={() => set('weekStartsOn', i as 0 | 1)}
                  className={`px-md py-xs rounded text-label-xs transition-colors duration-150
                    ${settings.weekStartsOn === i
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon="palette">
          <Row label="Dark Mode">
            <Toggle enabled={settings.darkMode} onChange={v => set('darkMode', v)} />
          </Row>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      <div className="flex items-center gap-sm px-md py-xs border-b border-outline-variant bg-surface-container-low/60">
        <span className="material-symbols-outlined text-on-surface-variant text-[15px]">{icon}</span>
        <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">{title}</h3>
      </div>
      <div className="divide-y divide-outline-variant/50">
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-md py-sm gap-lg">
      <span className="text-label-sm text-on-surface shrink-0">{label}</span>
      <div className="flex items-center justify-end">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none
        ${enabled ? 'bg-secondary' : 'bg-surface-container-high'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-on-primary shadow transform transition-transform duration-200
          ${enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}`}
      />
    </button>
  );
}
