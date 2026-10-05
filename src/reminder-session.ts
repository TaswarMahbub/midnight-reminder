import { shouldRemind } from "./reminder-policy.js";

const REMINDER_MESSAGE =
  "It is after midnight. Consider saving your work and getting some sleep.";

const CHECK_INTERVAL_MS = 30_000;

type ReminderSessionOptions = {
  now: () => Date;
  notify: (message: string) => void;
};

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createReminderSession(options: ReminderSessionOptions) {
  let lastRemindedDate: string | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;

  function check(): void {
    const currentTime = options.now();

    if (!shouldRemind(currentTime, lastRemindedDate)) {
      return;
    }

    lastRemindedDate = localDateKey(currentTime);
    options.notify(REMINDER_MESSAGE);
  }

  function start(): void {
    check();

    if (timer !== undefined) {
      return;
    }

    timer = setInterval(check, CHECK_INTERVAL_MS);
  }

  function stop(): void {
    if (timer === undefined) {
      return;
    }

    clearInterval(timer);
    timer = undefined;
  }

  return {
    check,
    start,
    stop,
  };
}