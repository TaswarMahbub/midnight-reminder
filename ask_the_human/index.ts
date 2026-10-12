import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { askUser, formatQuestion } from "./ask-user.js";

export default function askTheHuman(pi: ExtensionAPI) {
  pi.registerTool({
    name: "ask_user",
    label: "Ask the Human",
    description: "Ask the user for guidance when an important decision is unclear.",
    parameters: Type.Object({
      question: Type.String(),
      reason: Type.String(),
      options: Type.Optional(Type.Array(Type.String())),
      recommendation: Type.Optional(Type.String()),
    }),
    promptSnippet: "Ask the user for guidance on important unresolved decisions.",
    promptGuidelines: [
      "Only ask the user for decisions that are important and cannot be easily reversed.",
      "Do not use this tool for routine or trivial choices.",
      "If the human cancels or the UI is unavailable, do not invent an answer.",
    ],
    execute: async (_id, params, signal, _update, ctx) => {
      const result = await askUser(params, async (input) => {
        if (!ctx.hasUI) {
          throw new Error("UI unavailable");
        }
        const prompt = formatQuestion(input);
        if (!input.options || input.options.length === 0) {
          return await ctx.ui.input(prompt, undefined, { signal });
        }
        const customOption = "Other (type your answer)";
        const options = [...input.options];

        // Avoid duplicating the custom option if it already exists.
        if (!options.includes(customOption)) {
          options.push(customOption);
        }

        const selection = await ctx.ui.select(prompt, options, { signal });

        if (selection === customOption) {
          return await ctx.ui.input(
            "Enter your custom answer:",
            undefined,
            { signal }
          );
        }

        return selection;
      });

      return {
        content: [{
          type: "text",
          text: result.status === "answered"
            ? `Human answer: ${result.answer}`
            : `No human answer (${result.reason})`,
        }],
        details: result,
      };
    },
  });
}
