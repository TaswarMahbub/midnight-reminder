import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const REMINDER_MESSAGE =
  "It is after midnight. Consider saving your work and getting some sleep.";

export default function midnightReminder(pi: ExtensionAPI) {
  pi.registerCommand("bedtime-test", {
    description: "Preview the midnight reminder",

    handler: async (_args, ctx) => {
      ctx.ui.notify(REMINDER_MESSAGE, "info");
    },
  });
}