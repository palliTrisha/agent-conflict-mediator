import { useState, type ReactNode, type CSSProperties } from 'react';
import { Calendar, Users, Check, ArrowRight, Sparkles, ClipboardList } from 'lucide-react';

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');";
const SANS = "'Inter', Arial, sans-serif";
const SERIF = "'Fraunces', Georgia, serif";
const DASH = "'Space Grotesk', 'Inter', Arial, sans-serif";

const CREAM = '#FFFBF7';
const MIST = '#E9F0FA';
const INK = '#4D688C';

type Condition = 'none' | 'factual' | 'empathetic' | 'voice';
type Mode = 'participant' | 'researcher';
type Score = 'frustration' | 'fairness' | 'trust' | 'clarity' | 'voice';
type Stage = 'profile' | 'scenario' | 'decision' | 'context' | 'checkin' | 'complete';
type Profile = { age: string; experience: string; baselineTrust: number; fairnessValue: string; importance: number };
type Response = Profile & Record<Score, number> & { id: number; condition: Condition; note: string };

const conditionLabels: Record<Condition, string> = {
  none: 'No explanation',
  factual: 'Factual explanation',
  empathetic: 'Empathetic explanation',
  voice: 'Explanation + voice',
};
const randomCondition = (): Condition => {
  const keys = Object.keys(conditionLabels) as Condition[];
  return keys[Math.floor(Math.random() * keys.length)];
};
const emptyProfile = (): Profile => ({ age: '', experience: '', baselineTrust: 4, fairnessValue: '', importance: 4 });
const emptyScores = (): Record<Score, number> => ({ frustration: 4, fairness: 4, trust: 4, clarity: 4, voice: 4 });

export default function App() {
  const [mode, setMode] = useState<Mode>('researcher');
  const [stage, setStage] = useState<Stage>('profile');
  const [condition, setCondition] = useState<Condition>('voice');
  const [assignment, setAssignment] = useState<Condition | 'random'>('random');
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [scores, setScores] = useState<Record<Score, number>>(emptyScores());
  const [note, setNote] = useState('');
  const [context, setContext] = useState('Deadline urgency');
  const [responses, setResponses] = useState<Response[]>([]);

  const startParticipant = () => {
    setMode('participant');
    setStage('profile');
    setCondition(assignment === 'random' ? randomCondition() : assignment);
    setProfile(emptyProfile());
    setScores(emptyScores());
    setNote('');
    setContext('Deadline urgency');
  };
  const submit = () => {
    setResponses((all) => [...all, { id: all.length + 1, condition, ...profile, ...scores, note }]);
    setStage('complete');
  };

  return (
    <div style={{ minHeight: '100vh', background: CREAM, color: INK, fontFamily: SANS }}>
      <style>{FONT_IMPORT}</style>
      <header style={{ borderBottom: `1px solid ${INK}22`, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: INK, display: 'inline-block' }} />
            <p style={{ fontWeight: 600, fontSize: 19, margin: 0 }}>Experiment Prototype</p>
          </div>
          <div style={{ display: 'flex', borderRadius: 999, background: MIST, padding: 3, fontSize: 14, position: 'relative' }}>
            <button
              onClick={startParticipant}
              style={{
                borderRadius: 999, padding: '7px 16px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
                background: mode === 'participant' ? INK : 'transparent', color: mode === 'participant' ? CREAM : INK,
                transition: 'all 0.15s ease',
              }}
            >
              Participant view
            </button>
            <button
              onClick={() => setMode('researcher')}
              style={{
                borderRadius: 999, padding: '7px 16px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
                background: mode === 'researcher' ? INK : 'transparent', color: mode === 'researcher' ? CREAM : INK,
                transition: 'all 0.15s ease',
              }}
            >
              Researcher view
            </button>
          </div>
        </div>
      </header>

      {mode === 'researcher' ? (
        <Researcher responses={responses} onStart={startParticipant} assignment={assignment} setAssignment={setAssignment} />
      ) : (
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28 }}>
          <ParticipantSidebar stage={stage} />
          <Participant
            stage={stage} condition={condition} profile={profile} setProfile={setProfile}
            scores={scores} setScores={setScores} note={note} setNote={setNote}
            context={context} setContext={setContext} setStage={setStage} onSubmit={submit} onRestart={startParticipant}
          />
        </div>
      )}
    </div>
  );
}

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${INK}14`, boxShadow: '0 1px 2px rgba(77,104,140,0.04)', ...style }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) {
  const isNumeric = typeof value === 'number' || /^[\d.]+$/.test(String(value));
  return (
    <Card style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, color: `${INK}99`, margin: 0, fontWeight: 500 }}>{label}</p>
        {icon}
      </div>
      <p style={{
        fontSize: isNumeric ? 24 : 16, fontWeight: 600, margin: 0, letterSpacing: '-0.01em',
        fontFamily: DASH, color: isNumeric ? INK : `${INK}dd`,
      }}>
        {value}
      </p>
    </Card>
  );
}

function Researcher({ responses, onStart, assignment, setAssignment }: { responses: Response[]; onStart: () => void; assignment: Condition | 'random'; setAssignment: (value: Condition | 'random') => void }) {
  const avgTrust = responses.length
    ? (responses.reduce((s, r) => s + r.trust, 0) / responses.length).toFixed(1)
    : '—';
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: `${INK}80`, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: DASH }}>Researcher workspace</p>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: '4px 0 0', lineHeight: 1, letterSpacing: '-0.015em', fontFamily: SERIF }}>Response review</h1>
        </div>
        <button
          onClick={onStart}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: INK, color: CREAM, border: 'none', borderRadius: 999, padding: '10px 20px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}
        >
          <Sparkles size={15} /> Begin session
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 28, flexWrap: 'wrap' }}>
        <StatCard label="Responses recorded" value={responses.length} icon={<ClipboardList size={15} color={`${INK}66`} />} />
        <StatCard label="Design" value={assignment === 'random' ? 'Randomized' : conditionLabels[assignment]} />
        <StatCard label="Avg. trust (1–7)" value={avgTrust} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginTop: 20, alignItems: 'start' }}>
        <AssignmentControl assignment={assignment} setAssignment={setAssignment} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${INK}14`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={16} />
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0, fontFamily: DASH }}>Recorded responses</p>
            </div>
            {responses.length === 0 ? (
              <p style={{ padding: 48, textAlign: 'center', fontSize: 14, color: `${INK}99`, margin: 0 }}>No responses recorded.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 720, textAlign: 'left', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: `${INK}80`, fontFamily: DASH }}>
                      {['ID', 'Condition', 'Age', 'AI experience', 'Frustration', 'Fairness', 'Trust', 'Clarity'].map((h) => (
                        <th key={h} style={{ padding: '10px 20px', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? 'transparent' : `${MIST}66` }}>
                        <td style={{ padding: '12px 20px' }}>{String(r.id).padStart(2, '0')}</td>
                        <td style={{ padding: '12px 20px', fontWeight: 500 }}>{conditionLabels[r.condition]}</td>
                        <td style={{ padding: '12px 20px' }}>{r.age}</td>
                        <td style={{ padding: '12px 20px' }}>{r.experience}</td>
                        <td style={{ padding: '12px 20px' }}>{r.frustration}/7</td>
                        <td style={{ padding: '12px 20px' }}>{r.fairness}/7</td>
                        <td style={{ padding: '12px 20px' }}>{r.trust}/7</td>
                        <td style={{ padding: '12px 20px' }}>{r.clarity}/7</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function AssignmentControl({ assignment, setAssignment }: { assignment: Condition | 'random'; setAssignment: (value: Condition | 'random') => void }) {
  const options: { value: Condition | 'random'; label: string }[] = [
    { value: 'random', label: 'Random assignment' },
    { value: 'none', label: 'No explanation' },
    { value: 'factual', label: 'Factual explanation' },
    { value: 'empathetic', label: 'Empathetic explanation' },
    { value: 'voice', label: 'Explanation + voice' },
  ];
  return (
    <Card style={{ padding: 18 }}>
      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, fontFamily: DASH }}>Participant condition</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setAssignment(option.value)}
            style={{
              width: '100%', textAlign: 'left', border: `1px solid ${assignment === option.value ? INK : 'transparent'}`,
              background: assignment === option.value ? MIST : `${MIST}55`, color: INK, borderRadius: 10,
              padding: '9px 12px', fontSize: 13, fontWeight: assignment === option.value ? 600 : 400,
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6, color: `${INK}99` }}>
        Use random assignment for participants. Select a condition to demonstrate that version.
      </p>
    </Card>
  );
}

const stageLabel: Record<Stage, string> = {
  profile: '01 · Profile', scenario: '02 · Scenario', decision: '03 · Decision',
  context: '03 · Decision', checkin: '04 · Check-in', complete: '04 · Check-in',
};

function Participant({ stage, condition, profile, setProfile, scores, setScores, note, setNote, context, setContext, setStage, onSubmit, onRestart }: { stage: Stage; condition: Condition; profile: Profile; setProfile: (p: Profile) => void; scores: Record<Score, number>; setScores: (s: Record<Score, number>) => void; note: string; setNote: (v: string) => void; context: string; setContext: (v: string) => void; setStage: (s: Stage) => void; onSubmit: () => void; onRestart: () => void }) {
  const setScore = (key: Score, value: number) => setScores({ ...scores, [key]: value });
  const explanation = condition === 'none'
    ? 'The other agent was selected.'
    : 'The other project was prioritized because its deadline is tomorrow and delaying it would affect four team members.';
  const profileReady = Boolean(profile.age && profile.experience && profile.fairnessValue);

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12, fontWeight: 500, color: `${INK}80`, marginBottom: 20 }}>
        <span>{stageLabel[stage]}</span>
      </div>

      {stage === 'profile' && (
        <section>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: 0, lineHeight: 1, letterSpacing: '-0.015em', fontFamily: SERIF }}>Before you begin</h1>
          <p style={{ marginTop: 12, color: `${INK}cc` }}>Do not enter identifying information.</p>
          <Card style={{ marginTop: 24, padding: 24, display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
            <Choice label="Age range" value={profile.age} options={['18–24', '25–34', '35–44', '45+']} onChange={(v) => setProfile({ ...profile, age: v })} />
            <Choice label="Experience using AI tools" value={profile.experience} options={['Rarely', 'Sometimes', 'Often', 'Very often']} onChange={(v) => setProfile({ ...profile, experience: v })} />
            <Choice label="Most important fairness principle" value={profile.fairnessValue} options={['Equal treatment', 'Urgent need', 'Greatest group benefit', 'Individual need']} onChange={(v) => setProfile({ ...profile, fairnessValue: v })} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>General trust in AI</p>
              <Scale value={profile.baselineTrust} onChange={(v) => setProfile({ ...profile, baselineTrust: v })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Importance of obtaining the resource</p>
              <Scale value={profile.importance} onChange={(v) => setProfile({ ...profile, importance: v })} />
            </div>
          </Card>
          <PrimaryButton disabled={!profileReady} onClick={() => setStage('scenario')} style={{ marginTop: 24 }}>Continue</PrimaryButton>
        </section>
      )}

      {stage === 'scenario' && (
        <section>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: 0, lineHeight: 1, letterSpacing: '-0.015em', fontFamily: SERIF }}>One resource. Two requests.</h1>
          <p style={{ marginTop: 12, fontSize: 17, lineHeight: 1.5, color: `${INK}cc` }}>
            Your AI agent and another employee&apos;s agent request the same high-performance computer for 2–5 PM.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 24 }}>
            <Case title="Your agent" project="Data-analysis project" deadline="In 3 days" people="1 person" highlight={false} />
            <Case title="Other agent" project="Release-blocking project" deadline="Tomorrow" people="4 people" highlight />
          </div>
          <PrimaryButton onClick={() => setStage('decision')} style={{ marginTop: 24 }}>Review allocation</PrimaryButton>
        </section>
      )}

      {stage === 'decision' && (
        <section>
          <p style={{ fontSize: 12, fontWeight: 600, color: `${INK}99`, margin: 0 }}>Decision</p>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: '4px 0 0', lineHeight: 1, letterSpacing: '-0.015em', fontFamily: SERIF }}>The other agent is selected.</h1>
          <Card style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${INK}14`, fontSize: 12, fontWeight: 600, color: `${INK}99` }}>
              Mediator record
            </div>
            <p style={{ padding: 20, lineHeight: 1.6, margin: 0 }}>{explanation}</p>
            {(condition === 'empathetic' || condition === 'voice') && (
              <p style={{ padding: '16px 20px', borderTop: `1px solid ${INK}14`, lineHeight: 1.6, margin: 0, color: `${INK}cc`, background: `${MIST}55` }}>
                The mediator recognizes that this result may delay your work.
              </p>
            )}
          </Card>
          {condition === 'voice' && (
            <SecondaryButton onClick={() => setStage('context')} style={{ marginTop: 16 }}>Provide context</SecondaryButton>
          )}
          <div>
            <PrimaryButton onClick={() => setStage('checkin')} style={{ marginTop: 24 }}>Continue</PrimaryButton>
          </div>
        </section>
      )}

      {stage === 'context' && (
        <section>
          <p style={{ fontSize: 12, fontWeight: 600, color: `${INK}99`, margin: 0 }}>Additional context</p>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: '4px 0 0', lineHeight: 1, letterSpacing: '-0.015em', fontFamily: SERIF }}>What should be considered?</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 20 }}>
            {['Deadline urgency', 'Project impact', 'Accessibility need', 'Equal turn-taking'].map((item) => (
              <ChipButton key={item} selected={context === item} onClick={() => setContext(item)}>{item}</ChipButton>
            ))}
          </div>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note"
            style={{ marginTop: 16, width: '100%', minHeight: 80, borderRadius: 12, border: `1px solid ${INK}22`, background: MIST, padding: 12, fontFamily: 'inherit', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
          />
          <p style={{ marginTop: 16, borderLeft: `3px solid ${INK}`, background: `${MIST}66`, borderRadius: '0 12px 12px 0', padding: 14, fontSize: 14, lineHeight: 1.6 }}>
            The original allocation remains in place. Your request is reserved for the next available time period.
          </p>
          <PrimaryButton onClick={() => setStage('checkin')} style={{ marginTop: 24 }}>Continue to check-in</PrimaryButton>
        </section>
      )}

      {stage === 'checkin' && (
        <section>
          <p style={{ fontSize: 12, fontWeight: 600, color: `${INK}99`, margin: 0 }}>Check-in</p>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: '4px 0 0', lineHeight: 1, letterSpacing: '-0.015em', fontFamily: SERIF }}>Record your assessment.</h1>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Rating title="How frustrated do you feel?" value={scores.frustration} onChange={(v) => setScore('frustration', v)} />
            <Rating title="How fair was the decision process?" value={scores.fairness} onChange={(v) => setScore('fairness', v)} />
            <Rating title="How much do you trust your AI agent now?" value={scores.trust} onChange={(v) => setScore('trust', v)} />
            <Rating title="How clear was the mediator's explanation?" value={scores.clarity} onChange={(v) => setScore('clarity', v)} />
            <Rating title="How much opportunity did you have to make your situation understood?" value={scores.voice} onChange={(v) => setScore('voice', v)} />
          </div>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional comment"
            style={{ marginTop: 16, width: '100%', minHeight: 80, borderRadius: 12, border: `1px solid ${INK}22`, background: MIST, padding: 12, fontFamily: 'inherit', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
          />
          <PrimaryButton onClick={onSubmit} style={{ marginTop: 24 }}>Submit assessment</PrimaryButton>
        </section>
      )}

      {stage === 'complete' && (
        <section style={{ padding: '56px 0' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: `${INK}99`, margin: 0 }}>Session complete</p>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: '4px 0 0', lineHeight: 1, letterSpacing: '-0.015em', fontFamily: SERIF }}>Assessment recorded.</h1>
          <SecondaryButton onClick={onRestart} style={{ marginTop: 24 }}>Start new session</SecondaryButton>
        </section>
      )}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, style }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', fontSize: 15, fontWeight: 500,
        border: 'none', borderRadius: 999, padding: '12px 22px', cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? `${INK}33` : INK, color: CREAM, transition: 'transform 0.1s ease', ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children} <ArrowRight size={15} />
    </button>
  );
}

function SecondaryButton({ children, onClick, style }: { children: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'inherit', fontSize: 15, fontWeight: 500, border: `1px solid ${INK}`, background: 'transparent',
        color: INK, borderRadius: 999, padding: '11px 20px', cursor: 'pointer', ...style,
      }}
    >
      {children}
    </button>
  );
}

function ChipButton({ children, selected, onClick }: { children: ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, textAlign: 'left',
        border: `1px solid ${selected ? INK : `${INK}33`}`, borderRadius: 12, padding: '12px 14px', fontSize: 14,
        fontFamily: 'inherit', cursor: 'pointer', background: selected ? MIST : '#fff', fontWeight: selected ? 600 : 400,
      }}
    >
      {children}
      {selected && <Check size={15} />}
    </button>
  );
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map((option) => (
          <ChipButton key={option} selected={value === option} onClick={() => onChange(option)}>{option}</ChipButton>
        ))}
      </div>
    </div>
  );
}

function Scale({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', background: MIST, borderRadius: 999, padding: 3, gap: 2 }}>
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <button
          key={n} onClick={() => onChange(n)}
          style={{
            flex: 1, height: 34, borderRadius: 999, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', background: value === n ? INK : 'transparent', color: value === n ? CREAM : INK,
            transition: 'all 0.12s ease',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function Rating({ title, value, onChange }: { title: string; value: number; onChange: (v: number) => void }) {
  return (
    <Card style={{ padding: 18 }}>
      <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>{title}</p>
      <Scale value={value} onChange={onChange} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: `${INK}99`, marginTop: 8 }}>
        <span>Low</span><span>High</span>
      </div>
    </Card>
  );
}

function Case({ title, project, deadline, people, highlight }: { title: string; project: string; deadline: string; people: string; highlight?: boolean }) {
  return (
    <Card style={{ padding: 18, border: highlight ? `2px solid ${INK}` : 'none' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: `${INK}99`, margin: 0 }}>{title}</p>
      <h2 style={{ fontSize: 19, fontWeight: 600, margin: '4px 0 0', lineHeight: 1.15, fontFamily: SERIF }}>{project}</h2>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${INK}14`, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: `${INK}99` }}><Calendar size={14} /> Deadline</span>
          <span style={{ fontWeight: 500 }}>{deadline}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: `${INK}99` }}><Users size={14} /> People affected</span>
          <span style={{ fontWeight: 500 }}>{people}</span>
        </div>
      </div>
    </Card>
  );
}

function ParticipantSidebar({ stage }: { stage: Stage }) {
  const steps: [string, Stage][] = [
    ['Participant profile', 'profile'],
    ['Scenario', 'scenario'],
    ['Allocation', 'decision'],
    ['Check-in', 'checkin'],
  ];
  const activeIndex = steps.findIndex(([, key]) => key === stage || (key === 'decision' && stage === 'context'));
  const doneIndex = stage === 'complete' ? steps.length : activeIndex;

  return (
    <aside style={{ height: 'fit-content' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: `${INK}99`, margin: '0 0 16px' }}>Study progress</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map(([label], i) => {
          const isDone = i < doneIndex;
          const isActive = i === doneIndex;
          return (
            <div key={label} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone || isActive ? INK : MIST, color: isDone || isActive ? CREAM : INK, fontSize: 11, fontWeight: 600,
                  flexShrink: 0,
                }}>
                  {isDone ? <Check size={12} /> : i + 1}
                </div>
                {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, background: isDone ? INK : `${INK}22` }} />}
              </div>
              <p style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? INK : `${INK}99`, margin: '2px 0 20px' }}>{label}</p>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.6, color: `${INK}99`, marginTop: 4 }}>
        One explanation condition is assigned at random and remains hidden during the session.
      </p>
    </aside>
  );
}