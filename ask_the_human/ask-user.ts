export type AskUserInput = {
  question: string;
  reason: string;
  options?: string[];
  recommendation?: string;
};

export type AskUserResult =
  | {
      status: "answered";
      answer: string;
    }
  | {
      status: "unanswered";
      reason: "cancelled" | "unavailable";
    };

export function unansweredResult(
  reason: "cancelled" | "unavailable"
): AskUserResult {
  return {
    status: "unanswered",
    reason,
  };
}

export function answeredResult(answer: string): AskUserResult {
  return {
    status: "answered",
    answer,
  };
}

export function formatQuestion(input: AskUserInput): string {
  const parts = [input.reason, input.question];
  if (input.recommendation) {
    parts.push(`Recommendation: ${input.recommendation}`);
  }
  return parts.join("\n\n");
}

export async function askUser(
  input: AskUserInput,
  getAnswer: (question: AskUserInput) => Promise<string | undefined>
): Promise<AskUserResult> {
  try {
    const answer = await getAnswer(input);
    if (answer === undefined || answer.trim().length === 0) {
      return unansweredResult("cancelled");
    }
    return answeredResult(answer);
  } catch {
    return unansweredResult("unavailable");
  }
}
