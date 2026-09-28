import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Clipboard, LockKeyhole, Sparkles, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'ithink.flow-reflections.v1';

type AIChoice = 'use' | 'adapt' | 'skip' | '';

interface ReflectionEntry {
  id: string;
  createdAt: string;
  task: string;
  conditions: string;
  interruptions: string;
  focusBefore: number | null;
  focusAfter: number | null;
  observation: string;
  aiResponse: string;
  aiChoice: AIChoice;
  nextExperiment: string;
}

function isReflectionEntry(value: unknown): value is ReflectionEntry {
  if (typeof value !== 'object' || value === null) return false;

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.createdAt === 'string' &&
    !Number.isNaN(Date.parse(entry.createdAt)) &&
    typeof entry.task === 'string' &&
    typeof entry.conditions === 'string' &&
    typeof entry.interruptions === 'string' &&
    (entry.focusBefore === null ||
      (typeof entry.focusBefore === 'number' && entry.focusBefore >= 1 && entry.focusBefore <= 5)) &&
    (entry.focusAfter === null ||
      (typeof entry.focusAfter === 'number' && entry.focusAfter >= 1 && entry.focusAfter <= 5)) &&
    typeof entry.observation === 'string' &&
    typeof entry.aiResponse === 'string' &&
    (entry.aiChoice === '' ||
      entry.aiChoice === 'use' ||
      entry.aiChoice === 'adapt' ||
      entry.aiChoice === 'skip') &&
    typeof entry.nextExperiment === 'string'
  );
}

function buildAIPrompt(entry: Omit<ReflectionEntry, 'id' | 'createdAt'>) {
  return `I am reflecting on a focused-work session. Please act as a careful thinking partner, not an expert on my inner life.

Help me examine my own account:
- Separate what I directly observed from my interpretation.
- Reflect the details I shared without adding facts or guessing at hidden motives.
- Ask up to two open, non-leading questions that help me clarify my experience.
- Offer at most one small, optional experiment I could try. I decide whether it fits.
- Treat my focus ratings as self-report only. Do not diagnose me, claim to detect a flow or brain state, or present one session as proof.
- If my notes suggest that more reflection could become unhelpful, suggest pausing and returning to a concrete activity.

My session
Task: ${entry.task}
Conditions I noticed: ${entry.conditions.trim() || 'Not recorded'}
Interruptions: ${entry.interruptions || 'Not recorded'}
My self-reported focus before (1 = low, 5 = high): ${entry.focusBefore === null ? 'Not rated' : `${entry.focusBefore}/5`}
My self-reported focus after (1 = low, 5 = high): ${entry.focusAfter === null ? 'Not rated' : `${entry.focusAfter}/5`}

My own observation:
${entry.observation}`;
}

const FOCUS_OPTIONS = [
  { value: 1, label: 'Very low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Mixed' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Very high' },
];

const FLOW_LENSES = [
  {
    id: 'challenge-skill',
    title: 'Challenge and skill balance',
    group: 'THE TASK',
    description: 'The task feels demanding, yet within reach of the skills you can bring to it.',
    question: 'What part felt like a stretch, and what made it feel manageable?',
  },
  {
    id: 'clear-goals',
    title: 'Clear goals',
    group: 'THE TASK',
    description: 'You can tell what the next meaningful step is, even if the whole task is complex.',
    question: 'At each moment, did you know what to do next?',
  },
  {
    id: 'feedback',
    title: 'Unambiguous feedback',
    group: 'THE TASK',
    description: 'The activity gives you understandable cues about how an action is working, without needing outside praise.',
    question: 'What cues helped you tell whether your actions were working?',
  },
  {
    id: 'concentration',
    title: 'Concentration on task',
    group: 'ATTENTION',
    description: 'Attention gathers around the activity; competing concerns may feel less prominent for a while.',
    question: 'What held your attention, and what interrupted it?',
  },
  {
    id: 'action-awareness',
    title: 'Action and awareness merging',
    group: 'ATTENTION',
    description: 'Doing and noticing can feel closely connected, with less attention split between action and self-monitoring.',
    question: 'Did the next action feel deliberate, automatic, or somewhere between?',
  },
  {
    id: 'control',
    title: 'Sense of control',
    group: 'ATTENTION',
    description: 'You may feel able to respond to what the task asks. That does not mean every outcome is under your control.',
    question: 'When something changed, how able did you feel to respond?',
  },
  {
    id: 'self-consciousness',
    title: 'Loss of self-consciousness',
    group: 'THE FEELING',
    description: 'Attention may shift away from judging how you appear. This is not losing awareness or identity.',
    question: 'How much were you monitoring or judging yourself while doing it?',
  },
  {
    id: 'time',
    title: 'Transformation of time',
    group: 'THE FEELING',
    description: 'Time can seem to pass quickly or slowly. That feeling is subjective, not a clock reading.',
    question: 'Did your sense of time match the clock, or feel different?',
  },
  {
    id: 'autotelic',
    title: 'Autotelic experience',
    group: 'THE FEELING',
    description: 'A technical term for finding the activity rewarding in itself, beyond its result or an external reward.',
    question: 'Was any part of the activity satisfying in itself?',
  },
];

const fieldClass = 'flow-state-lab__field';
const cardClass = 'flow-state-lab__card';

export const FlowStateLab: React.FC = () => {
  const [challengeLevel, setChallengeLevel] = useState(3);
  const [skillLevel, setSkillLevel] = useState(3);
  const [exploredChallengeSkill, setExploredChallengeSkill] = useState(false);
  const [choseFlowLens, setChoseFlowLens] = useState(false);
  const [selectedFlowLens, setSelectedFlowLens] = useState(FLOW_LENSES[0].id);
  const [task, setTask] = useState('');
  const [conditions, setConditions] = useState('');
  const [interruptions, setInterruptions] = useState('');
  const [focusBefore, setFocusBefore] = useState<number | null>(null);
  const [focusAfter, setFocusAfter] = useState<number | null>(null);
  const [observation, setObservation] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [aiChoice, setAIChoice] = useState<AIChoice>('');
  const [nextExperiment, setNextExperiment] = useState('');
  const [sessions, setSessions] = useState<ReflectionEntry[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [storageReadFailure, setStorageReadFailure] = useState(false);
  const [canClearUnreadableHistory, setCanClearUnreadableHistory] = useState(false);
  const [status, setStatus] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let stored: string | null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      setStorageError(
        'This browser did not allow access to saved reflections. You can still explore the prompts, but saving and deleting are paused.'
      );
      setStorageReadFailure(true);
      setStorageReady(true);
      return;
    }

    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed) || !parsed.every(isReflectionEntry)) {
          throw new Error('Saved reflection data has an unexpected format.');
        }
        setSessions(parsed);
      } catch {
        setStorageError(
          'Saved reflection data could not be read and has not been changed. Remove the unreadable data explicitly to start fresh.'
        );
        setStorageReadFailure(true);
        setCanClearUnreadableHistory(true);
      }
    }
    setStorageReady(true);
  }, []);

  const draft = useMemo(
    () => ({
      task: task.trim(),
      conditions,
      interruptions,
      focusBefore,
      focusAfter,
      observation: observation.trim(),
      aiResponse: aiResponse.trim(),
      aiChoice,
      nextExperiment: nextExperiment.trim(),
    }),
    [
      task,
      conditions,
      interruptions,
      focusBefore,
      focusAfter,
      observation,
      aiResponse,
      aiChoice,
      nextExperiment,
    ]
  );
  const aiPrompt = useMemo(() => buildAIPrompt(draft), [draft]);
  const activeFlowLens = FLOW_LENSES.find(lens => lens.id === selectedFlowLens) ?? FLOW_LENSES[0];
  const challengeSkillDifference = challengeLevel - skillLevel;
  const challengeSkillReadout = challengeSkillDifference >= 2
    ? {
      title: 'The stretch may feel steep',
      detail: 'A smaller next step, more practice, or added support could make this task feel more workable.',
    }
    : challengeSkillDifference <= -2
      ? {
        title: 'The task may feel under-stretching',
        detail: 'If you want more engagement, a fresh goal or a meaningful constraint might add challenge.',
      }
      : challengeLevel <= 2 && skillLevel <= 2
        ? {
          title: 'A gentle, balanced task',
          detail: 'A close match can feel comfortable. Flow models also emphasize meaningful challenge; balance alone is not a sign of flow.',
        }
      : {
        title: 'A potentially workable fit',
        detail: 'Flow theory often discusses a balance between challenge and skill. It is one possible condition, not proof or a recipe.',
      };
  const fieldQuestCheckpoints = [
    { label: 'Explore the model', complete: exploredChallengeSkill },
    { label: 'Choose a lens', complete: choseFlowLens },
    { label: 'Write a fieldnote', complete: Boolean(task.trim() && observation.trim()) },
    { label: 'Plan one small tweak', complete: Boolean(nextExperiment.trim()) },
  ];
  const completedQuestCheckpoints = fieldQuestCheckpoints.filter(checkpoint => checkpoint.complete).length;

  const saveSession = () => {
    if (!draft.task || !draft.observation) {
      setStatus('Add the task and your own observation before saving.');
      return;
    }
    if (storageReadFailure) {
      setStatus('Resolve the saved-data issue before saving a reflection.');
      return;
    }

    const entry: ReflectionEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...draft,
    };

    try {
      const nextSessions = [entry, ...sessions];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
      setSessions(nextSessions);
      setStorageError('');
      setStatus('Reflection saved in this browser.');
    } catch {
      setStorageError('This browser could not save your reflection. Your current entries are still on screen.');
      setStatus('');
    }
  };

  const deleteSession = (id: string) => {
    const nextSessions = sessions.filter(session => session.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
      setSessions(nextSessions);
      setStorageError('');
      setStatus('Reflection deleted.');
    } catch {
      setStorageError('This browser could not update your saved reflection history.');
    }
  };

  const clearUnreadableHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSessions([]);
      setStorageError('');
      setStorageReadFailure(false);
      setCanClearUnreadableHistory(false);
      setStatus('Unreadable reflection data was removed from this browser.');
    } catch {
      setStorageError('This browser could not remove the unreadable saved data.');
    }
  };

  const copyPrompt = async () => {
    if (!draft.task || !draft.observation) {
      setCopyStatus('Add the task and your own observation to prepare a prompt.');
      return;
    }

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard access is unavailable in this browser.');
      }
      await navigator.clipboard.writeText(aiPrompt);
      setCopyStatus('Prompt copied. Paste it into an AI service you choose.');
    } catch {
      promptRef.current?.focus();
      promptRef.current?.select();
      setCopyStatus('Could not copy automatically. The prompt is selected; copy it with Ctrl+C.');
    }
  };

  const startNewReflection = () => {
    setTask('');
    setConditions('');
    setInterruptions('');
    setFocusBefore(null);
    setFocusAfter(null);
    setObservation('');
    setAIResponse('');
    setAIChoice('');
    setNextExperiment('');
    setStatus('');
    setCopyStatus('');
  };

  const renderFocusRating = (
    label: string,
    value: number | null,
    onChange: (value: number) => void,
    groupName: string
  ) => (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-zinc-200">{label}</legend>
      <div className="grid grid-cols-5 gap-2">
        {FOCUS_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            aria-label={`${groupName}: ${option.value}, ${option.label}`}
            onClick={() => onChange(option.value)}
            className={`rounded-lg border px-2 py-2 text-center text-xs transition ${
              value === option.value
                ? 'border-emerald-200/50 bg-emerald-200/10 text-emerald-100'
                : 'border-white/[0.08] bg-black/20 text-zinc-400 hover:border-white/20'
            }`}
          >
            <span className="block font-mono text-sm">{option.value}</span>
            <span className="hidden pt-1 sm:block">{option.label}</span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-zinc-500">Your rating, not a brain or attention measurement.</p>
    </fieldset>
  );

  return (
    <div className="flow-state-lab mx-auto max-w-6xl space-y-6">
      <section className="flow-state-lab__hero" aria-labelledby="flow-lab-title">
        <div className="flow-state-lab__hero-copy">
          <div className="flow-state-lab__eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            <span>FLOW FIELD GUIDE <i /> PSYCHOLOGY IN PRACTICE</span>
          </div>
          <h1 id="flow-lab-title">Flow is a feeling.<br /><span>Not a finding.</span></h1>
          <p>
            Flow describes deep involvement in an activity. Explore the psychology behind it, then use
            your own experience, not a score or brain readout, as the starting point.
          </p>
          <div className="flow-state-lab__guardrail">
            <LockKeyhole size={15} aria-hidden="true" />
            <span>This guide cannot detect flow. No brain data or diagnosis; notes stay local unless you choose to copy them.</span>
          </div>
        </div>
        <aside className="flow-state-lab__lens" aria-label="Questions to notice in a flow reflection">
          <span className="flow-state-lab__lens-kicker">THE EXPERIENCE, FROM INSIDE</span>
          <h2>Look past “I was focused.”</h2>
          <div className="flow-state-lab__lens-list">
            <div><i>01</i><span>Attention<small>What held it, and what pulled it away?</small></span></div>
            <div><i>02</i><span>Task fit<small>Was the next step clear and workable?</small></span></div>
            <div><i>03</i><span>Experience<small>Did action, time, or self-focus shift?</small></span></div>
            <div><i>04</i><span>Meaning<small>Was the activity rewarding in itself?</small></span></div>
          </div>
          <p>Flow has several reported features; no single feeling is a pass/fail test.</p>
        </aside>
        <div className="flow-state-lab__method" aria-label="A simple self-observation method">
          {[
            ['01', 'Observe', 'Recall a real session'],
            ['02', 'Describe', 'Separate details from labels'],
            ['03', 'Change one thing', 'Choose a small experiment'],
            ['04', 'Compare', 'Repeat and notice differences'],
          ].map(([number, label, detail], index) => (
            <div className="flow-state-lab__method-step" key={number}>
              <span>{number}</span>
              <div><strong>{label}</strong><small>{detail}</small></div>
              {index < 3 && <ArrowRight size={15} aria-hidden="true" />}
            </div>
          ))}
        </div>
      </section>

      <section className="flow-state-lab__field-guide" aria-labelledby="flow-guide-title">
        <div className="flow-state-lab__guide-heading">
          <span className="flow-state-lab__section-number">FIELD GUIDE <i>· EXPLORE</i></span>
          <h2 id="flow-guide-title">A useful model. Not a magic formula.</h2>
          <p>
            Flow theory often describes a changing fit between the challenge of an activity and the
            skills you bring. Explore the idea, then pick one lens for your own fieldnote.
          </p>
        </div>

        <div className="flow-state-lab__quest" aria-label="Field quest progress">
          <div className="flow-state-lab__quest-heading">
            <div>
              <span className="flow-state-lab__lens-kicker">YOUR FIELD QUEST</span>
              <p>Four curiosity checkpoints. No score to chase, just a sharper question about your session.</p>
            </div>
            <strong aria-live="polite">{completedQuestCheckpoints}<span> / 4</span></strong>
          </div>
          <div
            className="flow-state-lab__quest-track"
            role="progressbar"
            aria-label="Field quest checkpoints completed"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={completedQuestCheckpoints}
            aria-valuetext={`${completedQuestCheckpoints} of 4 field quest checkpoints completed`}
          >
            <span style={{ width: `${completedQuestCheckpoints * 25}%` }} />
          </div>
          <ol className="flow-state-lab__quest-steps">
            {fieldQuestCheckpoints.map((checkpoint, index) => (
              <li key={checkpoint.label} className={checkpoint.complete ? 'is-complete' : ''}>
                <span>{checkpoint.complete ? <Check size={12} aria-hidden="true" /> : String(index + 1).padStart(2, '0')}</span>
                {checkpoint.label}
              </li>
            ))}
          </ol>
        </div>

        <div className="flow-state-lab__explorer">
          <div className="flow-state-lab__explorer-controls">
            <div className="flow-state-lab__explorer-title">
              <span className="flow-state-lab__orbit-mark" aria-hidden="true"><i /></span>
              <div>
                <span className="flow-state-lab__lens-kicker">INTERACTIVE MODEL</span>
                <h3>Tune the task, not yourself</h3>
              </div>
            </div>
            <label className="flow-state-lab__range">
              <span><strong>Challenge</strong><small>How demanding does the task feel?</small></span>
              <output aria-label={`Challenge rating ${challengeLevel} out of five`}>{challengeLevel}<span> / 5</span></output>
              <input
                id="flow-challenge"
                type="range"
                min="1"
                max="5"
                value={challengeLevel}
                onChange={event => {
                  setChallengeLevel(Number(event.target.value));
                  setExploredChallengeSkill(true);
                }}
                aria-label="Perceived challenge of the task, from lower to higher"
              />
              <span className="flow-state-lab__range-ends"><small>Lower</small><small>Higher</small></span>
            </label>
            <label className="flow-state-lab__range">
              <span><strong>Skill</strong><small>How ready do your current skills feel?</small></span>
              <output aria-label={`Skill rating ${skillLevel} out of five`}>{skillLevel}<span> / 5</span></output>
              <input
                id="flow-skill"
                type="range"
                min="1"
                max="5"
                value={skillLevel}
                onChange={event => {
                  setSkillLevel(Number(event.target.value));
                  setExploredChallengeSkill(true);
                }}
                aria-label="Perceived skill for the task, from lower to higher"
              />
              <span className="flow-state-lab__range-ends"><small>Lower</small><small>Higher</small></span>
            </label>
          </div>

          <div className="flow-state-lab__model" aria-label="Illustration of perceived challenge and skill">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-labelledby="flow-model-title flow-model-description">
              <title id="flow-model-title">Challenge and skill model</title>
              <desc id="flow-model-description">
                A conceptual chart. The marker moves as you change the challenge and skill sliders.
                It illustrates a theory, not a measurement of your state.
              </desc>
              <path className="flow-state-lab__model-grid" d="M20 20V80H80" />
              <path className="flow-state-lab__model-diagonal" d="M20 80L80 20" />
              <circle
                className="flow-state-lab__model-point"
                cx={20 + (skillLevel - 1) * 15}
                cy={80 - (challengeLevel - 1) * 15}
                r="4.5"
              />
            </svg>
            <span className="flow-state-lab__axis flow-state-lab__axis--vertical">CHALLENGE</span>
            <span className="flow-state-lab__axis flow-state-lab__axis--horizontal">SKILL</span>
            <p className="flow-state-lab__model-readout" aria-live="polite">
              <strong>{challengeSkillReadout.title}</strong>
              <span>{challengeSkillReadout.detail}</span>
            </p>
          </div>
          <p className="flow-state-lab__model-caveat">
            Your sliders describe your impression of a task. The map is a simplified teaching model, not a flow test.
          </p>
        </div>

        <div className="flow-state-lab__lens-explorer">
          <div className="flow-state-lab__lens-intro">
            <span className="flow-state-lab__lens-kicker">PICK A LENS · 9 IDEAS FROM FLOW RESEARCH</span>
            <p>Tap a concept to unpack it. You do not need to experience every feature for your session to matter.</p>
          </div>
          <div className="flow-state-lab__lens-grid" role="group" aria-label="Choose a flow psychology concept">
            {FLOW_LENSES.map((lens, index) => (
              <button
                key={lens.id}
                type="button"
                aria-pressed={selectedFlowLens === lens.id}
                onClick={() => {
                  setSelectedFlowLens(lens.id);
                  setChoseFlowLens(true);
                }}
                className="flow-state-lab__lens-button"
              >
                <span>{String(index + 1).padStart(2, '0')} <i>· {lens.group}</i></span>
                <strong>{lens.title}</strong>
              </button>
            ))}
          </div>
          <div className="flow-state-lab__lens-detail" aria-live="polite">
            <div>
              <span>{activeFlowLens.group} / LENS SELECTED</span>
              <h3>{activeFlowLens.title}</h3>
              <p>{activeFlowLens.description}</p>
            </div>
            <blockquote>
              <span>ASK YOURSELF</span>
              <p>“{activeFlowLens.question}”</p>
            </blockquote>
            <a href="#flow-observation" className="flow-state-lab__lens-link">
              Carry this lens into a reflection <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
          <p className="flow-state-lab__framework-note">
            These nine features come from a classic psychological model of flow. They are useful ideas to explore,
            not a checklist or a guarantee that a task will produce flow.
          </p>
        </div>
      </section>

      {storageError && (
        <div role="alert" className="rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm text-amber-100">
          <p>{storageError}</p>
          {storageReady && canClearUnreadableHistory && (
            <button
              type="button"
              onClick={clearUnreadableHistory}
              className="mt-3 text-xs font-semibold underline underline-offset-4"
            >
              Remove unreadable saved reflections and start fresh
            </button>
          )}
        </div>
      )}

      <section id="flow-observation" className={`${cardClass} flow-state-lab__form-card`} aria-labelledby="notice-heading">
        <div className="mb-6 flex items-start gap-3">
          <span className="flow-state-lab__section-number">01 <i>· OBSERVE</i></span>
          <div>
            <h2 id="notice-heading" className="text-lg font-semibold text-white">Bring one real session into focus</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Use the lens you chose, or ignore the lenses. Describe what happened without deciding whether it “counts” as flow.
            </p>
          </div>
        </div>

        <label className="block space-y-2 text-sm font-medium text-zinc-200">
          What were you working on?
          <input
            className={fieldClass}
            value={task}
            onChange={event => setTask(event.target.value)}
            placeholder="A task or activity"
            maxLength={160}
          />
        </label>

        <label className="mt-5 block space-y-2 text-sm font-medium text-zinc-200">
          What did you notice about your experience?
          <textarea
            className={`${fieldClass} min-h-32 resize-y`}
            value={observation}
            onChange={event => setObservation(event.target.value)}
            placeholder={`For example: ${activeFlowLens.question} What happened before, during, and after?`}
            maxLength={2000}
          />
          <span className="block text-right text-[11px] font-normal text-zinc-500">
            {observation.length}/2,000
          </span>
        </label>

        <div className="flow-state-lab__interpretation mt-5">
          <span className="flow-state-lab__section-number">02 <i>· DESCRIBE</i></span>
          <h3>Keep observation separate from interpretation</h3>
          <div className="flow-state-lab__contrast">
            <p><strong>Observation</strong><span>“I worked on the draft for 25 minutes and noticed two interruptions.”</span></p>
            <p><strong>Interpretation</strong><span>“I may have stayed engaged because the next step was clear.”</span></p>
          </div>
          <p className="flow-state-lab__hint">Both can be useful. Mark interpretations as possibilities, not facts about what caused the experience.</p>
        </div>

        <details className="flow-state-lab__optional mt-5 rounded-xl border border-white/[0.07] bg-black/20 p-4">
          <summary className="cursor-pointer text-sm font-medium text-zinc-300">
            Add context or self-ratings <span className="text-xs font-normal text-zinc-500">(optional)</span>
          </summary>
          <div className="mt-4 space-y-4">
            <label className="block space-y-2 text-sm font-medium text-zinc-200">
            What else may have shaped the session?
            <input
              className={fieldClass}
              value={conditions}
              onChange={event => setConditions(event.target.value)}
              placeholder="Time, place, tools, energy, or anything relevant"
              maxLength={240}
            />
          </label>

            <fieldset className="mt-4 space-y-2">
              <legend className="text-sm font-medium text-zinc-200">Were there interruptions?</legend>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'none', label: 'None' },
                  { value: 'some', label: 'Some' },
                  { value: 'unsure', label: 'Not sure' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={interruptions === option.value}
                    onClick={() => setInterruptions(option.value)}
                    className={`rounded-full border px-3 py-2 text-xs transition ${
                      interruptions === option.value
                        ? 'border-emerald-200/50 bg-emerald-200/10 text-emerald-100'
                        : 'border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {renderFocusRating('Focus before', focusBefore, setFocusBefore, 'Before')}
              {renderFocusRating('Focus after', focusAfter, setFocusAfter, 'After')}
            </div>
          </div>
        </details>
      </section>

      <details className={`${cardClass} flow-state-lab__optional-card`}>
        <summary id="ai-heading" className="cursor-pointer list-none text-sm font-semibold text-white">
          <span className="text-violet-300">Optional · </span>Think it through with AI
          <span className="mt-1 block text-xs font-normal leading-5 text-zinc-400">
            Review and copy a prompt only if you want an outside perspective.
          </span>
        </summary>
        <div className="mt-5">

        <div className="mb-4 flex items-start gap-2 rounded-xl border border-white/[0.07] bg-black/20 p-3 text-xs leading-5 text-zinc-400">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <p>
            This prototype does not send data to an AI automatically. Copying shares the text on your screen to your
            clipboard; pasting it into another service is subject to that service&apos;s privacy settings.
          </p>
        </div>

        <label className="block space-y-2 text-xs font-medium text-zinc-400">
          Prompt preview
          <textarea
            ref={promptRef}
            className={`${fieldClass} min-h-28 resize-y font-mono text-xs leading-5`}
            value={aiPrompt}
            readOnly
            aria-label="AI reflection prompt preview"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-200 px-4 py-2.5 text-xs font-bold text-[#102017] transition hover:bg-emerald-100"
          >
            <Clipboard className="h-4 w-4" />
            Copy prompt for my AI
          </button>
          <span role="status" aria-live="polite" className="text-xs text-zinc-400">{copyStatus}</span>
        </div>

        <label className="mt-6 block space-y-2 text-sm font-medium text-zinc-200">
          If you consulted an AI, what did it suggest?
          <textarea
            className={`${fieldClass} min-h-24 resize-y`}
            value={aiResponse}
            onChange={event => setAIResponse(event.target.value)}
            placeholder="Optional. Paste or summarize only what you want to keep."
            maxLength={1200}
          />
          <span className="block text-xs font-normal text-zinc-500">
            You are the judge of whether its response fits your experience.
          </span>
        </label>

        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-2 w-full text-sm font-medium text-zinc-200">What will you do with the suggestion?</legend>
          {[
            { value: 'use' as const, label: 'Try it' },
            { value: 'adapt' as const, label: 'Adapt it' },
            { value: 'skip' as const, label: 'Leave it' },
          ].map(option => (
            <button
              key={option.value}
              type="button"
              aria-pressed={aiChoice === option.value}
              onClick={() => setAIChoice(option.value)}
              className={`rounded-full border px-3 py-2 text-xs transition ${
                aiChoice === option.value
                  ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-100'
                  : 'border-white/10 text-zinc-400 hover:border-white/20'
              }`}
            >
              {option.label}
            </button>
          ))}
        </fieldset>
        </div>
      </details>

      <section className={`${cardClass} flow-state-lab__form-card`} aria-labelledby="choose-heading">
        <div className="mb-5 flex items-start gap-3">
          <span className="flow-state-lab__section-number">03 <i>· TEST</i></span>
          <div>
            <h2 id="choose-heading" className="text-lg font-semibold text-white">Make the next session informative</h2>
          </div>
        </div>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Pick one small change. Keep the task roughly similar, then compare your own experience next time.
        </p>

        <label className="mt-4 block space-y-2 text-sm font-medium text-zinc-200">
          One thing I will change
          <input
            className={fieldClass}
            value={nextExperiment}
            onChange={event => setNextExperiment(event.target.value)}
            placeholder="For example: silence notifications for one 20-minute writing block"
            maxLength={240}
          />
        </label>

        <div className="flow-state-lab__compare mt-5">
          <span className="flow-state-lab__section-number">04 <i>· COMPARE NEXT TIME</i></span>
          <p>After a similar session, make a second reflection. Compare your own notes: what changed, what stayed similar, and what else might explain the difference?</p>
          <small>One comparison cannot establish cause. Treat it as a clue for what to explore next.</small>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-5">
          <button
            type="button"
            onClick={saveSession}
            disabled={!storageReady || storageReadFailure}
            className="flow-state-lab__save inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Save my reflection
          </button>
          <button
            type="button"
            onClick={startNewReflection}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            Start over
          </button>
          <span role="status" aria-live="polite" className="text-xs text-zinc-400">{status}</span>
        </div>
      </section>

      <details className={`${cardClass} flow-state-lab__optional-card`} open={sessions.length > 0}>
        <summary id="history-heading" className="cursor-pointer list-none text-sm font-semibold text-white">
          Your reflection history
          <span className="mt-1 block text-xs font-normal text-zinc-500">
            {sessions.length} {sessions.length === 1 ? 'entry' : 'entries'} · saved only in this browser
          </span>
        </summary>
        <div className="mt-5">
          {sessions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-zinc-500">
              Save a reflection to see it here. Your notes are not synced or encrypted by this prototype.
            </p>
          ) : (
            <ul className="space-y-3">
              {sessions.map(session => (
              <li key={session.id} className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{session.task}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {new Date(session.createdAt).toLocaleString()} · Self-rated focus{' '}
                      {session.focusBefore === null ? 'not rated' : `${session.focusBefore}/5`} →{' '}
                      {session.focusAfter === null ? 'not rated' : `${session.focusAfter}/5`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    disabled={storageReadFailure}
                    aria-label={`Delete reflection about ${session.task}`}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-rose-300 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{session.observation}</p>
                {session.aiResponse && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-violet-300">AI perspective and my response</summary>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-400">{session.aiResponse}</p>
                    {session.aiChoice && (
                      <p className="mt-2 text-xs text-zinc-500">I chose to {session.aiChoice} the suggestion.</p>
                    )}
                  </details>
                )}
                {session.nextExperiment && (
                  <p className="mt-3 flex items-start gap-2 text-xs text-emerald-200">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Next experiment: {session.nextExperiment}
                  </p>
                )}
              </li>
              ))}
            </ul>
          )}
        </div>
      </details>

      <p className="flow-state-lab__research-note mx-auto max-w-3xl pb-2 text-center text-[11px] leading-5 text-zinc-500">
        This is an informal self-observation exercise, not a validated questionnaire or experiment with controlled
        conditions. Self-reports describe your experience; they do not diagnose, measure consciousness, or prove flow.
        For the classic nine-dimension self-report measure, see Jackson and Marsh&apos;s (1996){' '}
        <a
          className="text-emerald-200 underline underline-offset-2 hover:text-emerald-100"
          href="https://doi.org/10.1123/jsep.18.1.17"
          target="_blank"
          rel="noreferrer"
        >
          Flow State Scale
        </a>.
      </p>
    </div>
  );
};
