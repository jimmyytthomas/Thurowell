# AGENTS.md — Thurowell Build Spec

This is the single source of truth for building out Thurowell's interactive session
experience. Read this file fully before writing any code. Work through tasks in the
exact order listed. Do not skip ahead. When each task is complete, say so before
moving to the next one.

---

## Project Overview

Thurowell is a mental performance web app. Users check in with their current mental
state (stress, energy, focus on a 1–10 scale plus a goal), receive a protocol
recommendation from a rule-based engine, and then complete an interactive guided
session. Session data is stored locally.

**Current state of the repo:**
- Check-in form works
- Rule-based recommendation engine works
- 6 protocols defined in `lib/protocols.ts`
- App currently shows written instructions only — no interactive session exists
- No audio exists yet

**What we are building:**
- Interactive session experience for all 6 protocols
- Animated circle UI for all 5 breathwork protocols
- Audio playback UI for the body scan meditation
- Session complete screen with mood/feedback prompt
- Full visual redesign to dark, minimal, calm aesthetic

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- localStorage (via existing `lib/storage.ts`)
- No new npm packages unless absolutely necessary

---

## Visual Design System

Apply this design system consistently across every file you touch.

**Colors:**
- Background: `#0a0a0f`
- Surface (cards, panels): `#12121a`
- Border: `#1e1e2e`
- Text primary: `#e8e8f0`
- Text secondary: `#6e6e8a`
- Accent: `#7c6aee`

**Breathwork circle colors by phase:**
- Inhale: `#4a9eff` with soft blue glow
- Hold (full): `#a78bfa` with soft purple glow
- Exhale: `#34d399` with soft green glow
- Hold (empty): `#6e6e8a` with no glow

**Glow:** Use `box-shadow` or `filter: drop-shadow`. Soft, not neon.

**Circle scale:**
- Resting / empty: `scale(1.0)`
- Fully inhaled: `scale(1.35)`

**Transitions:** 300ms ease-in-out on all phase changes.

**Typography:** system-ui or Inter. Phase labels large and centered, light weight.

---

## File Structure

Do not create files outside of this structure.

```
thurowell/
├── app/
│   ├── page.tsx                  — Check-in form (restyle only)
│   ├── result/
│   │   └── page.tsx              — Recommendation result + Start Session button
│   ├── session/
│   │   └── page.tsx              — Session router
│   └── complete/
│       └── page.tsx              — Session complete screen
├── components/
│   ├── BreathingSession.tsx      — Animated circle for all 5 breathwork protocols
│   ├── MeditationSession.tsx     — Audio player for body scan
│   ├── SessionComplete.tsx       — Post-session feedback
│   ├── CheckInForm.tsx           — Existing (restyle only)
│   └── AppNav.tsx                — Existing (restyle only)
├── lib/
│   ├── protocols.ts              — DO NOT MODIFY
│   ├── recommend.ts              — DO NOT MODIFY
│   ├── storage.ts                — DO NOT MODIFY
│   └── breathPhases.ts           — NEW: phase timing configs
├── types/
│   └── index.ts                  — Extend only, do not remove existing types
└── public/
    └── audio/
        └── body-scan.mp3         — Added manually, do not create this file
```

---

## Task List — Work Through in Order

---

### Task 1 — Extend types/index.ts

Add the following types. Do not remove or rename anything already in this file.

```typescript
export type BreathPhase = {
  label: 'Inhale' | 'Hold' | 'Exhale' | 'Hold (empty)';
  duration: number; // seconds
  scale: number;    // circle scale target
  color: string;    // hex color
  glow: string;     // CSS box-shadow string or empty string
};

export type BreathProtocolConfig = {
  protocolId: string;
  phases: BreathPhase[];
  totalCycles: number;
};

export type SessionFeedback = {
  protocolId: string;
  completedAt: string; // ISO string
  moodBefore?: number; // 1–5
  moodAfter?: number;  // 1–5
  notes?: string;
};
```

---

### Task 2 — Create lib/breathPhases.ts

Create phase configs for all 5 breathwork protocols using the types from Task 1.
Use the color and glow values from the design system above.

**Box breathing** (`box-breathing`):
- Inhale 4s → Hold 4s → Exhale 4s → Hold (empty) 4s
- 5 cycles

**4-7-8 breathing** (`4-7-8-breathing`):
- Inhale 4s → Hold 7s → Exhale 8s
- 4 cycles

**Cyclic sighing** (`cyclic-sighing`):
- Inhale 3s → Inhale 1.5s (label: "Inhale (sip)") → Exhale 6s
- 6 cycles

**Bellows breath** (`bellows-breath`):
- Inhale 0.5s → Exhale 0.5s (rapid)
- 30 cycles, then 3 slow recovery breaths (Inhale 3s → Exhale 4s) appended

**Power breath** (`power-breath`):
- Inhale 3s → Exhale 4s
- 10 cycles

Export:
- `BREATH_CONFIGS: BreathProtocolConfig[]`
- `getBreathConfig(protocolId: string): BreathProtocolConfig | undefined`

---

### Task 3 — Create components/BreathingSession.tsx

Props:
```typescript
interface BreathingSessionProps {
  protocolId: string;
  onComplete: () => void;
}
```

Behavior:
- Import `getBreathConfig` from `lib/breathPhases.ts`
- Load config for the given protocolId on mount
- Run phases sequentially using `useEffect` and `setTimeout`
- Render a centered circle that:
  - Scales between 1.0 and 1.35 via CSS `transform: scale()`
  - Changes color and glow between phases (300ms transition)
  - Shows phase label above the circle
  - Shows countdown timer below the label
- Show cycle count below the circle (e.g. "Cycle 3 of 5")
- Show a subtle "End session early" text link at the bottom
- When all cycles complete, call `onComplete()`
- CSS transitions only — no animation libraries

---

### Task 4 — Create components/MeditationSession.tsx

Props:
```typescript
interface MeditationSessionProps {
  onComplete: () => void;
}
```

Behavior:
- Minimal dark screen, protocol name centered
- HTML `<audio>` element pointed at `/audio/body-scan.mp3`
- Play/pause button styled to match design system
- Progress bar that fills as audio plays
- Elapsed time and total duration displayed
- When audio ends naturally, call `onComplete()`
- "End session early" text link at the bottom

---

### Task 5 — Create app/session/page.tsx

- Read `protocolId` from URL search params
- If protocolId is `body-scan`, render `<MeditationSession />`
- Otherwise render `<BreathingSession protocolId={protocolId} />`
- On `onComplete`:
  - Save a partial `SessionFeedback` object to localStorage via `storage.ts`
  - Navigate to `/complete`

---

### Task 6 — Create components/SessionComplete.tsx and app/complete/page.tsx

- Dark screen with soft checkmark or completion indicator
- Heading: "Session complete"
- Subheading: protocol name
- Two mood selectors (1–5 button row, not sliders):
  - "How did you feel before?"
  - "How do you feel now?"
- Optional notes textarea (placeholder: "Any observations...")
- "Save & finish" button — saves full `SessionFeedback` to localStorage, navigates to `/`
- "Skip" text link — navigates to `/` without saving

---

### Task 7 — Update app/result/page.tsx

- Apply dark design system
- Show protocol name, description, duration cleanly
- Add a prominent "Start Session" button with accent color `#7c6aee`
- Button navigates to `/session?protocolId={id}`
- Do not change any recommendation logic

---

### Task 8 — Restyle app/page.tsx and global styles

- Apply dark design system to check-in form
- Background `#0a0a0f`, surface `#12121a`, accent `#7c6aee` on active states and buttons
- Update global styles to set body background and default text color
- Restyle AppNav to match
- Logic changes only if strictly necessary for styling — do not touch recommendation logic

---

## Session Flow

```
/ (check-in)
  → user enters stress, energy, focus, goal
  → submit

/result
  → protocol name, description, duration
  → "Start Session" button

/session?protocolId={id}
  → BreathingSession or MeditationSession
  → on complete → save partial feedback → navigate to /complete

/complete
  → mood before/after, optional notes
  → save → navigate to /
```

---

## Rules

1. Work through tasks in order — do not skip ahead
2. TypeScript strict mode — no `any` types
3. No new npm packages without asking first
4. Do not modify `lib/protocols.ts`, `lib/recommend.ts`, or `lib/storage.ts`
5. Do not remove existing exports from any file
6. All components must be default exports
7. Mobile-first — all layouts must work at 375px width and up
8. No placeholder content — graceful empty states only
9. Remove all console.log before marking a task complete
10. After each task, confirm it is done before moving to the next one

---

## What You Do Not Handle

- Generating or placing `public/audio/body-scan.mp3` (done manually via ElevenLabs)
- Supabase or user accounts (future roadmap)
- Vercel deployment (auto-deploys on git push)
