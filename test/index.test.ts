import { describe, expect, it, vi } from "vitest";
import midnightReminder from "../src/index.js";

describe("Pi extension integration", () => {
  it("does not create a timer or notify in noninteractive mode", () => {
    vi.useFakeTimers();

    try {
      const handlers = new Map<string, Function>();
      const notify = vi.fn();

      const pi = {
        registerCommand: vi.fn(),

        on: vi.fn((event: string, handler: Function) => {
          handlers.set(event, handler);
          return () => {};
        }),
      };

      midnightReminder(pi as any);

      const sessionStart = handlers.get("session_start");

      expect(sessionStart).toBeDefined();

      sessionStart?.(
        {
          type: "session_start",
          reason: "startup",
        },
        {
          mode: "print",
          hasUI: false,
          ui: {
            notify,
          },
        }
      );

      expect(notify).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
  it ("registers a session_start handler", ()=> {
    const handlers= new Map<string, Function>();"

    const pi= {
      registerCommand: vi.fn(),
      on: vi.fn((event:string, handler: Function) => {
        handlers.set(event,handler);
        return ()=> {};
      }),
    };
    midnightReminder( pi as any);
    expect(handlers.get("session_start")).toBeDefined();
  });
});
