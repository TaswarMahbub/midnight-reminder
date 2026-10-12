# Ask the Human — Pi Extension

A Pi extension that allows an AI coding agent to pause and ask the user for guidance when an important decision is unresolved. Instead of silently making a consequential assumption, the agent can explain the decision, present options and an optional recommendation, receive a human answer, and continue with that answer.

This document describes the scope, behavior, implementation, verification, and usage of Ask the Human. It coexists with the separate Midnight Reminder extension in the same repository.

---

## 1. Scope

- Register an `ask_user` tool in an interactive Pi session.
- Allow the agent to ask a question and explain why human input is needed.
- Support predefined choices and free-text answers, including a custom answer when choices are supplied.
- Return the user's answer to the agent so it can continue its task.
- Represent cancellation, empty input, and unavailable UI without inventing a human decision.

## 2. Non-goals

- Do not ask the human about every routine implementation detail.
- Do not automatically approve irreversible operations when no answer is provided.
- Do not make a decision on the user's behalf after cancellation or when the UI is unavailable.
- Do not require Herdr to run the extension; Herdr was used for development coordination, not as a runtime dependency.
- Do not modify the Midnight Reminder behavior.

## 3. Definitions

| Term | Meaning |
|---|---|
| **`ask_user`** | The Pi tool registered by this extension to request human guidance. |
| **Important unresolved choice** | A decision that materially affects the task and should not be silently decided by the agent. |
| **Reason** | The context explaining why the question needs human input. |
| **Options** | An optional list of suggested answers shown in a selection dialog. |
| **Recommendation** | An optional suggested choice shown alongside the question; it is not automatically accepted. |
| **Custom answer** | Free text supplied by the user, either directly or after selecting **Other (type your answer)**. |
| **Answered** | A nonempty response was received from the user. |
| **Unanswered** | No usable human answer was obtained because the interaction was cancelled, empty, or unavailable. |
| **Interactive UI** | A Pi interface capable of showing a selection or input dialog. |

---

## 4. Functional requirements

Requirements are numbered for traceability. Section 7 maps each requirement to a verification approach.

### Tool registration and question context

- **R1 — Register the tool.** The extension registers a Pi tool named `ask_user`.
- **R2 — Required context.** Tool calls include a `question` and a `reason` explaining the unresolved decision.
- **R3 — Optional guidance.** Tool calls may provide `options` and a `recommendation`.
- **R4 — Appropriate use.** Tool guidance directs the agent to ask about important, difficult-to-reverse decisions rather than routine choices.

### Human interaction

- **R5 — Predefined choices.** When options are supplied, the extension presents them in a selection dialog.
- **R6 — Open-ended response.** When options are omitted or empty, the extension presents a text input.
- **R7 — Custom choice.** When options are supplied, the dialog also includes **Other (type your answer)**; selecting it opens a text input.
- **R8 — Return the answer.** A nonempty answer is returned to the agent as `Human answer: ...` with structured result details.
- **R9 — Preserve abort signal.** UI dialogs receive the execution abort signal.

### Unanswered interactions

- **R10 — Cancellation.** If the user dismisses a dialog without answering, the result is `unanswered` with reason `cancelled`.
- **R11 — Empty response.** Empty or whitespace-only text is not treated as a valid decision; it is reported as `unanswered` with reason `cancelled`.
- **R12 — Unavailable UI.** If interactive UI is unavailable or the UI operation throws, the result is `unanswered` with reason `unavailable`.
- **R13 — No invented approval.** When no answer is received, the tool returns `No human answer (...)` rather than fabricating a selection.

---

## 5. Interaction and result model

The extension registers one tool with these parameters:

| Parameter | Type | Required | Purpose |
|---|---|---|---|
| `question` | `string` | Yes | What the human needs to decide. |
| `reason` | `string` | Yes | Why the decision needs human guidance. |
| `options` | `string[]` | No | Suggested answers in a selection dialog. |
| `recommendation` | `string` | No | Optional recommendation displayed with the question. |

The interaction follows this sequence:

1. Pi calls `ask_user` with a question and reason.
2. The extension checks whether interactive UI is available.
3. With predefined options, it displays a selection dialog that also offers **Other (type your answer)**. Without options, it opens a text input.
4. If the user chooses **Other**, a second dialog accepts custom text.
5. The extension returns an answered or unanswered result; the agent can use the answer to continue.

### Result shapes

A valid response produces:

```json
{ "status": "answered", "answer": "SQLite" }
```

Cancellation or an empty response produces:

```json
{ "status": "unanswered", "reason": "cancelled" }
```

An unavailable or failing interactive UI produces:

```json
{ "status": "unanswered", "reason": "unavailable" }
```

The tool also returns readable text to the agent, such as `Human answer: SQLite` or `No human answer (cancelled)`.

**Important:** The extension reports the human's response; it does not itself execute a database migration, delete files, or enforce how the agent uses the decision afterward.

---

## 6. Verification approach

The implementation is verified through automated unit tests and manual interaction in Pi.

- Unit tests exercise answer handling without requiring a live Pi UI.
- Extension tests mock Pi's tool registration and UI methods to verify the dialog behavior and returned results.
- Manual Pi checks demonstrate that a real agent can call `ask_user`, receive a selection or custom answer, and continue.
- Cancellation and unavailable-UI behavior are checked so that no answer is fabricated.

---

## 7. Acceptance criteria traceability

| # | Acceptance criterion | Requirement | Verification |
|---|---|---|---|
| 1 | Register `ask_user` as a Pi tool. | R1 | Extension registration test |
| 2 | Require a question and a reason. | R2 | TypeBox tool parameter schema |
| 3 | Accept optional choices and a recommendation. | R3 | Schema and question-format tests |
| 4 | Guide the agent to ask only about important decisions. | R4 | Prompt-guidance test |
| 5 | Display supplied choices. | R5 | Selection-dialog test; manual Pi test |
| 6 | Accept free text when no options are supplied. | R6 | Input-dialog test; manual Pi test |
| 7 | Offer and accept a custom answer alongside predefined choices. | R7 | Custom-answer extension test; manual Pi test |
| 8 | Return the human answer to the agent. | R8 | Result assertions; manual Pi test |
| 9 | Forward the abort signal to UI dialogs. | R9 | Extension tests |
| 10 | Handle a cancelled dialog. | R10 | Unit and extension tests; manual Pi test |
| 11 | Reject empty and whitespace-only responses. | R11 | Parameterized unit tests |
| 12 | Handle unavailable interactive UI. | R12 | Unit test for unavailable UI |
| 13 | Never invent an answer when none is provided. | R13 | Unanswered-result assertions |

---

## 8. Implementation

The Ask the Human implementation lives in `ask_the_human/`:

| File | Responsibility |
|---|---|
| `index.ts` | Registers `ask_user` with Pi, defines its parameter schema and prompt guidance, opens selection/input dialogs, and returns results to the agent. |
| `ask-user.ts` | Defines input/result types, formats the question, and normalizes answered, cancelled, empty, and unavailable outcomes. |
| `index.test.ts` | Tests extension registration, dialog calls, abort-signal forwarding, custom-answer handling, and custom-input cancellation. |
| `ask-user.test.ts` | Tests answer handling, empty/whitespace responses, cancellation, unavailable UI, and question formatting. |

The Midnight Reminder source files under `src/` and its tests under `test/` remain separate.

### Multi-agent development workflow

The initial implementation used **Herdr** to coordinate three Pi agents:

- **Orchestrator:** Coordinated implementation work and identified tasks.
- **Implementation worker:** Developed the TypeScript tool and tests.
- **Independent reviewer:** Reviewed the implementation and suggested corrections.

The implementation was subsequently verified locally and extended with explicit handling for empty responses and a custom-answer option. Herdr is **not** required to install, test, or run `ask_user`.

---

## 9. Installation

From the repository root, install dependencies:

```bash
npm ci
```

`npm ci` uses the committed lockfile for a reproducible installation. If you are developing without a lockfile, `npm install` is the alternative.

You also need a working Pi installation for the interactive demonstration.

---

## 10. Running the extension

Launch Pi from the repository root:

```bash
pi --extension ./ask_the_human/index.ts
```

Ask Pi to use the tool for a consequential unresolved choice, for example:

> Use `ask_user` to ask me which database to adopt for the project. Explain why this architectural choice matters, offer PostgreSQL and MongoDB, and wait for my answer before proceeding.

The selection dialog offers the suggested choices plus **Other (type your answer)**. Selecting **Other** allows a response such as `SQLite` even though it was not among the original suggestions.

For a purely open-ended question, ask Pi to call `ask_user` without predefined options. Pi will show a text input instead of a selection list.

If the dialog is cancelled, the agent receives an unanswered result. The extension does not treat cancellation as permission to proceed with an irreversible action.

---

## 11. Testing

Run all automated tests from the repository root:

```bash
npm test
```

Check TypeScript types:

```bash
npm run typecheck
```

Optionally check for whitespace errors in uncommitted changes:

```bash
git diff --check
```

**Latest locally verified result:** 26 tests passed across 5 test files, with TypeScript checking successful. This count includes tests for both Midnight Reminder and Ask the Human; it is **not** a claim that Ask the Human alone contains 26 tests.

Ask the Human tests cover:

- successful predefined answers;
- open-ended input and question formatting;
- custom answers after choosing **Other**;
- cancellation of the custom-answer input;
- empty and whitespace-only responses;
- unavailable UI;
- abort-signal forwarding; and
- registration of the tool's prompt guidance.

The Midnight Reminder tests continue to run as part of the same `npm test` command.

---

## 12. Demo

A short demonstration can show the complete human-in-the-loop flow:

1. Launch Pi with `pi --extension ./ask_the_human/index.ts`.
2. Give the agent a task with an important unresolved decision, such as choosing a database.
3. Show the agent calling `ask_user` and presenting the reason and options.
4. Choose an option or select **Other (type your answer)** and enter a custom response.
5. Show the answer returned to the agent and the agent continuing with that decision.
6. Run `npm test` and show the passing test summary.

Edge cases such as cancellation, empty responses, and unavailable UI can be verified through automated tests without including every scenario in a short demonstration.

The Ask the Human source and tests are available on the [`ask-the-human` branch](https://github.com/TaswarMahbub/midnight-reminder/tree/ask-the-human).
