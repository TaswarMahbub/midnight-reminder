import { describe, expect, it, vi } from "vitest";
import askTheHuman from "./index.js";

describe("askTheHuman extension", () => {
  it("passes the abort signal to the UI dialog", async () => {
    const tools = new Map<string, any>();

    const pi = {
      registerTool: vi.fn((tool: any) => {
        tools.set(tool.name, tool);
      }),
    };

    askTheHuman(pi as any);

    const askUserTool = tools.get("ask_user");
    expect(askUserTool).toBeDefined();

    const controller = new AbortController();
    const signal = controller.signal;

    const selectMock = vi.fn().mockResolvedValue("Blue");

    const ctx = {
      hasUI: true,
      ui: {
        input: vi.fn(),
        select: selectMock,
        notify: vi.fn(),
      },
    };

    await askUserTool.execute(
      "call-1",
      {
        question: "Which color?",
        reason: "Cannot decide.",
        options: ["Blue", "Green"],
      },
      signal,
      undefined,
      ctx
    );

    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(selectMock).toHaveBeenCalledWith(
      "Cannot decide.\n\nWhich color?",
      ["Blue", "Green", "Other (type your answer)"],
      { signal }
    );
  });

  it("passes the abort signal to input when there are no options", async () => {
    const tools = new Map<string, any>();

    const pi = {
      registerTool: vi.fn((tool: any) => {
        tools.set(tool.name, tool);
      }),
    };

    askTheHuman(pi as any);

    const askUserTool = tools.get("ask_user");
    expect(askUserTool).toBeDefined();

    const controller = new AbortController();
    const signal = controller.signal;

    const inputMock = vi.fn().mockResolvedValue("Open-ended answer");

    const ctx = {
      hasUI: true,
      ui: {
        input: inputMock,
        select: vi.fn(),
        notify: vi.fn(),
      },
    };

    await askUserTool.execute(
      "call-2",
      {
        question: "What do you think?",
        reason: "Need your opinion.",
      },
      signal,
      undefined,
      ctx
    );

    expect(inputMock).toHaveBeenCalledTimes(1);
    expect(inputMock).toHaveBeenCalledWith(
      "Need your opinion.\n\nWhat do you think?",
      undefined,
      { signal }
    );
  });

  it("accepts a custom answer when options are provided", async () => {
    const tools = new Map<string, any>();
    const pi = {
      registerTool: vi.fn((tool: any) => tools.set(tool.name, tool)),
    };

    askTheHuman(pi as any);
    const tool = tools.get("ask_user");

    const controller = new AbortController();
    const signal = controller.signal;

    const selectMock = vi.fn().mockResolvedValue("Other (type your answer)");
    const inputMock = vi.fn().mockResolvedValue("Purple");

    const ctx = {
      hasUI: true,
      ui: {
        select: selectMock,
        input: inputMock,
      },
    };

    const result = await tool.execute(
      "custom-answer",
      {
        question: "Which color?",
        reason: "Branding decision.",
        options: ["Blue", "Green"],
      },
      signal,
      undefined,
      ctx
    );

    expect(selectMock).toHaveBeenCalledWith(
      "Branding decision.\n\nWhich color?",
      ["Blue", "Green", "Other (type your answer)"],
      { signal }
    );
    expect(inputMock).toHaveBeenCalledWith(
      "Enter your custom answer:",
      undefined,
      { signal }
    );
    expect(result.details).toEqual({
      status: "answered",
      answer: "Purple",
    });
  });

  it("does not invent an answer when custom input is cancelled", async () => {
    const tools = new Map<string, any>();
    const pi = {
      registerTool: vi.fn((tool: any) => tools.set(tool.name, tool)),
    };

    askTheHuman(pi as any);
    const tool = tools.get("ask_user");

    const ctx = {
      hasUI: true,
      ui: {
        select: vi.fn().mockResolvedValue("Other (type your answer)"),
        input: vi.fn().mockResolvedValue(undefined),
      },
    };

    const result = await tool.execute(
      "cancel-custom",
      {
        question: "Which color?",
        reason: "Branding decision.",
        options: ["Blue", "Green"],
      },
      new AbortController().signal,
      undefined,
      ctx
    );

    expect(ctx.ui.input).toHaveBeenCalledTimes(1);
    expect(result.details).toEqual({
      status: "unanswered",
      reason: "cancelled",
    });
    expect(result.content[0].text).toBe("No human answer (cancelled)");
  });

  it("registers promptSnippet and promptGuidelines", () => {
    const tools = new Map<string, any>();

    const pi = {
      registerTool: vi.fn((tool: any) => {
        tools.set(tool.name, tool);
      }),
    };

    askTheHuman(pi as any);

    const askUserTool = tools.get("ask_user");
    expect(askUserTool).toBeDefined();

    expect(askUserTool.promptSnippet).toBe(
      "Ask the user for guidance on important unresolved decisions."
    );
    expect(askUserTool.promptGuidelines).toEqual([
      "Only ask the user for decisions that are important and cannot be easily reversed.",
      "Do not use this tool for routine or trivial choices.",
      "If the human cancels or the UI is unavailable, do not invent an answer.",
    ]);
  });
});
