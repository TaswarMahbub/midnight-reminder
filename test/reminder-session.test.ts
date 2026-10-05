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
});