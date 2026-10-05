import { describe, expect, it, vi } from "vitest";
import { createReminderSession } from "../src/reminder-session.js";

describe("reminder session", () => {
  it("notifies on startup during the reminder window", () => {
    const notify = vi.fn();
    const now = () => new Date(2026, 9, 5, 0, 30);

    const session = createReminderSession({
      now,
      notify,
    });

    session.check();

    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("does not notify twice on the same local date", () => {
    const notify = vi.fn();
    const now = () => new Date(2026, 9, 5, 0, 30);

    const session = createReminderSession({
      now,
      notify,
    });

    session.check();
    session.check();

    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("does not notify outside the reminder window", () => {
    const notify = vi.fn();
    const now = () => new Date(2026, 9, 5, 12, 0);

    const session = createReminderSession({
      now,
      notify,
    });

    session.check();

    expect(notify).not.toHaveBeenCalled();
  });

  it("checks automatically when the timer fires", () => {
    vi.useFakeTimers();

    try {
      let currentTime = new Date(2026, 9, 4, 23, 59, 30);
      const notify = vi.fn();
      const now = () => currentTime;

      const session = createReminderSession({
        now,
        notify,
      });

      session.start();

      expect(notify).not.toHaveBeenCalled();

      currentTime = new Date(2026, 9, 5, 0, 0, 0);
      vi.advanceTimersByTime(30_000);

      expect(notify).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(30_000);

      expect(notify).toHaveBeenCalledTimes(1);

      session.stop();
    } finally {
      vi.useRealTimers();
    }
  });

  it("stops automatic checks when the session is stopped", () => {
    vi.useFakeTimers();

    try {
      let currentTime = new Date(2026, 9, 4, 23, 59, 30);
      const notify = vi.fn();
      const now = () => currentTime;

      const session = createReminderSession({
        now,
        notify,
      });

      session.start();
      session.stop();

      currentTime = new Date(2026, 9, 5, 0, 0, 0);
      vi.advanceTimersByTime(30_000);

      expect(notify).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});