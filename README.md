# Midnight Reminder — Pi Extension

A Pi extension that reminds the user, at most once per local calendar date, when
their session is running during the late-night window. The user is always free
to keep working; the reminder is advisory and non-blocking.

This document contains the original W1-1 specification together with the
implementation, testing, and usage instructions completed in later work items.

---

## 1. Scope

- A single Pi extension loaded into an interactive Pi session.
- Emits a visible, non-blocking reminder during a defined late-night window.
- Owns a timer that fires within one minute after local midnight.

## 2. Non-goals

- No system clock changes, OS notifications, or waking the computer.
- No persistence of reminder state across Pi restarts (optional, not required).
- No blocking model calls, blocking tools, or terminating Pi.
- No network access.

## 3. Definitions

| Term | Meaning |
|---|---|
| **Local time zone** | The machine's current local time zone, as observed by Pi at runtime. Not UTC or a hard-coded offset. |
| **Late-night window** | Local time `00:00:00` (inclusive) up to but excluding `06:00:00`. |
| **Interactive session** | A Pi session with a live interactive UI where user-facing notifications can be displayed. |
| **Extension session** | The lifetime of one loaded extension runtime, from `session_start` to `session_shutdown`. |
| **Reminder** | A visible message such as: "It is after midnight. Consider saving your work and getting some sleep." |
| **Automatic reminder** | A reminder emitted by the extension's timer or startup/resume logic (as opposed to a manual preview). |
| **Check** | One evaluation of whether the current local time falls inside the late-night window. |
| **Supplied/simulated time** | A time value injected into logic for testing, instead of reading the real clock. |

---

## 4. Functional requirements

Requirements are numbered for traceability. The acceptance criteria in
[Section 7](#7-acceptance-criteria-traceability) map one-to-one to these IDs.

### Time and window

- **R1 — Local time zone.** All time comparisons use the machine's local time zone. No UTC-only or fixed-offset logic.
- **R2 — Window bounds.** The late-night window is `00:00` inclusive through `06:00` exclusive. `06:00:00` exactly is **outside** the window.
- **R3 — Resume after 06:00.** If execution resumes after `06:00` on a date whose window was missed, the reminder is skipped; no catch-up reminder is emitted.

### Reminder content and behavior

- **R4 — Visible, non-blocking message.** The reminder is shown to the user with text equivalent to: "It is after midnight. Consider saving your work and getting some sleep." The user remains free to continue working; Pi is not blocked or terminated.

### Automatic triggers

- **R5 — Automatic post-midnight reminder.** While an interactive Pi session stays open and the computer is awake, the extension must produce an automatic reminder within one minute after local midnight, with no additional user prompt required.
- **R6 — Startup inside window.** If Pi starts when local time is within the window (`00:00`–`06:00`), the reminder is emitted on startup.
- **R7 — Resume inside window.** If execution resumes during the window after a pause (e.g. machine sleep/wake or paused processing), the reminder is emitted on the next check.

### Deduplication and state

- **R8 — Once per date per session.** At most one automatic reminder is emitted per local calendar date during the current extension session.
- **R9 — No duplicates from repeats.** Repeated user prompts or repeated timer checks must not create duplicate automatic reminders for the same date.
- **R10 — Fresh session/reload may remind again.** A fresh session or an extension reload may legitimately remind again on the same date. Persistence across restarts is optional and not required.
- **R11 — Process isolation.** Separate Pi processes hold separate reminder state; one process's state does not affect another's.

### Manual preview

- **R12 — `/bedtime-test` previews only.** The `/bedtime-test` command manually previews the reminder and must **not** change automatic reminder state (e.g., it must not consume or set the once-per-date flag).

### Lifecycle and resource safety

- **R13 — Stop timer on shutdown.** Any timer owned by the extension is stopped on session shutdown.
- **R14 — Reload safety.** Reloading the extension must not accumulate timers or keep using a stale context/callback from the previous runtime.

### Platform constraints

- **R15 — No extra model calls / blocking / termination.** The extension does not make extra model calls, use blocking tools, or terminate Pi.
- **R16 — Noninteractive operation.** In noninteractive operation, the extension neither sends the notification nor creates the timer.
- **R17 — No wake, no run when closed.** The extension does not wake a sleeping computer and does not run while Pi is closed.
- **R18 — Test with supplied time.** Tests must use simulated or supplied time. They must not change the system clock and must not wait for actual midnight.

---

## 5. State model (specification level)

Suggested conceptual state for the extension session. Names are illustrative;
implementation may differ as long as R8–R11 hold.

- `lastRemindedDate`: the local calendar date (e.g. `YYYY-MM-DD`) of the last
  **automatic** reminder in this session, or unset.
- `timer`: the single active timer handle for the post-midnight check, or unset.
- `context`: the current session's notification context (replaced on reload).

Invariants:

- At most one automatic reminder per `lastRemindedDate` value (R8, R9).
- At most one active timer per extension session (R13, R14).
- `/bedtime-test` never reads or writes `lastRemindedDate` (R12).

---

## 6. Verification approach

Later work items will verify these requirements with automated tests and manual
checks. To keep tests fast and deterministic:

- Clock reads must be injectable so tests supply `now` directly (R18).
- Tests must not call real `setTimeout`/`setInterval` without fake timers (R5, R13, R18).
- Tests must not modify the system clock or sleep until real midnight (R18).
- Noninteractive behavior is verified by running the extension in a noninteractive
  context and asserting no notification and no timer (R16).

---

## 7. Acceptance criteria traceability

| # | Acceptance criterion | Requirement |
|---|---|---|
| 1 | Use the machine's local time zone. | R1 |
| 2 | Late-night window is 00:00 inclusive through 06:00 exclusive. | R2 |
| 3 | Visible reminder such as the given text; user remains free to continue. | R4 |
| 4 | While an interactive session stays open and the computer is awake, an automatic reminder appears within one minute after midnight without another user prompt. | R5 |
| 5 | If Pi starts between 00:00 and 06:00, remind on startup. | R6 |
| 6 | If execution resumes during that window after a pause, remind on the next check. | R7 |
| 7 | At most one automatic reminder per local calendar date during the current extension session. | R8 |
| 8 | Repeated prompts or timer checks must not create duplicates. | R9 |
| 9 | A fresh session or extension reload may remind again; persistence across restarts is optional. | R10 |
| 10 | Separate Pi processes have separate state. | R11 |
| 11 | `/bedtime-test` manually previews the reminder without changing automatic reminder state. | R12 |
| 12 | Stop the timer on session shutdown. | R13 |
| 13 | Reloading must not accumulate timers or continue using an old context. | R14 |
| 14 | Do not make extra model calls, use blocking tools, or terminate Pi. | R15 |
| 15 | In noninteractive operation, do not send the notification and do not create the timer. | R16 |
| 16 | The extension does not wake a sleeping computer and does not run while Pi is closed. | R17 |
| 17 | If execution resumes after 06:00, skip the missed reminder. | R3 |
| 18 | Testing must use simulated/supplied time; do not change the system clock or wait until actual midnight. | R18 |

---

## 8. Implementation

The extension is implemented as three small pieces:

- `src/reminder-policy.ts` contains the pure time-window and once-per-date policy.
- `src/reminder-session.ts` manages session state, the 30-second periodic check,
  automatic reminders, and timer cleanup.
- `src/index.ts` integrates the reminder with Pi, registers `/bedtime-test`, starts
  automatic checking for interactive TUI sessions, and stops the timer on session
  shutdown.

The extension checks the current local time immediately when an interactive Pi
session starts and then every 30 seconds. This guarantees that, while Pi remains
open and the computer is awake, a check occurs within one minute after midnight.

Automatic reminder state is kept in memory for the current extension session.
Therefore, repeated checks on the same local calendar date do not produce
duplicate automatic reminders. A fresh extension session or reload may remind
again, as allowed by the specification.

## 9. Installation

Install the project dependencies:

```bash
npm install
```

## 10. Running the Extension

Launch Pi with only this extension:

```bash
pi --extension ./src/index.ts
```

In an interactive Pi session, manually preview the reminder with:

```text
/bedtime-test
```

The preview displays:

```text
It is after midnight. Consider saving your work and getting some sleep.
```

The manual preview does not modify the automatic reminder state.

### Automatic behavior

When running interactively, the extension:

1. checks the local time immediately on session startup;
2. checks again every 30 seconds;
3. automatically reminds during `00:00` inclusive through `06:00` exclusive;
4. emits at most one automatic reminder per local calendar date in the current
   extension session; and
5. stops its timer when the Pi session shuts down.

Noninteractive modes do not create the automatic timer or send the automatic
notification.

## 11. Testing

Run the automated test suite with:

```bash
npm test
```

Run the TypeScript type checker with:

```bash
npm run typecheck
```

The tests use supplied/simulated time and fake timers. They do not change the
machine's clock and do not wait for real midnight.

The automated tests cover:

- the `00:00` inclusive and `06:00` exclusive window boundaries;
- behavior before midnight and during the late-night window;
- once-per-local-date deduplication;
- eligibility again on the next local date;
- startup checks during the reminder window;
- simulated crossing of midnight while Pi remains open;
- repeated timer checks without duplicate reminders;
- timer cleanup;
- behavior outside the reminder window; and
- suppression of automatic timers and notifications in noninteractive mode.

## 12. Demo

The required behavior can be demonstrated without changing the system clock.

First, launch the extension and use `/bedtime-test` to demonstrate the visible
manual preview.

Then run:

```bash
npm test
```

The fake-clock and fake-timer tests demonstrate the automatic path, including a
simulated transition from `23:59:30` to `00:00:00`. The first timer check after
midnight produces one reminder, while a later check on the same local date does
not produce a duplicate.

The test suite also demonstrates startup behavior during the late-night window,
timer cleanup, and suppression of automatic behavior in noninteractive mode.
