import { describe, expect, it } from "vitest";
import { shouldRemind } from "../src/reminder-policy.js";

describe("shouldRemind", () => {
  it("does not remind at 23:59", () => {
    const now = new Date(2026, 9, 5, 23, 59);

    expect(shouldRemind(now, undefined)).toBe(false);
  });

  it("reminds at exactly 00:00 when not reminded today", () => {
    const now = new Date(2026, 9, 5, 0, 0);

    expect(shouldRemind(now, undefined)).toBe(true);
  });

  it("does not remind again at 00:01 when already reminded today", () => {
    const now = new Date(2026, 9, 5, 0, 1);

    expect(shouldRemind(now, "2026-10-05")).toBe(false);
  });

  it("reminds at 05:59 when not reminded today", () => {
    const now = new Date(2026, 9, 5, 5, 59);
  it("reminds at 05:59:59", () => {
    const now= new Date(2026,9,5,5,59,59);
    
    expect(shouldRemind(now, undefined)).toBe(true);
  });

  it("does not remind at 06:00", () => {
    const now = new Date(2026, 9, 5, 6, 0);

    expect(shouldRemind(now, undefined)).toBe(false);
  });

  it("reminds again at midnight on the next local date", () => {
    const now = new Date(2026, 9, 6, 0, 0);

    expect(shouldRemind(now, "2026-10-05")).toBe(true);
  });
});
