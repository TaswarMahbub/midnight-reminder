import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createReminderSession } from "./reminder-session.js";

const REMINDER_MESSAGE =
  "It is after midnight. Consider saving your work and getting some sleep.";

export default function midnightReminder(pi: ExtensionAPI) {
  let activeSession:
    | ReturnType<typeof createReminderSession>
    | undefined;

  pi.registerCommand("bedtime-test", {
    description: "Preview the midnight reminder",

    handler: async (_args, ctx) => {
      ctx.ui.notify(REMINDER_MESSAGE, "info");
    },
  });

  pi.on("session_start", (_event, ctx) => {
    // Automatic reminders run only in interactive TUI mode.
    if (ctx.mode !== "tui") {
      return;
    }

    // Defensive cleanup in case a new session_start occurs.
    activeSession?.stop();

    activeSession = createReminderSession({
      now: () => new Date(),

      notify: (message) => {
        ctx.ui.notify(message, "info");
      },
    });

    activeSession.start();
  });

  pi.on("session_shutdown", () => {
    activeSession?.stop();
    activeSession = undefined;
  });
}