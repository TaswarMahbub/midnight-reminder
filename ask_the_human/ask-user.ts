export type AskUserInput = {
  question: string;
  reason: string;
  options?: string[];
  recommendation?: string;
};
export type AskUserResult=
|{
  status: "answered";
  answer: string;
}
|{
  status: "unanswered";
  reason:"cancelled"| "unavailable";
};

  
export function unansweredResult(
  reason:"cancelled" | "unavailable"
): AskUserResult{
  return{
    status:"unanswered",
    reason: reason,
  };
}

export function answeredResult(answer: string): AskUserResult {
  return{
    status: "answered",
    answer: answer,
  };
}
export async function askUser(
  input: AskUserInput,
  getAnswer:(question: AskUserInput) => Promise<string | undefined >
  ): Promise<AskUserResult>{
  try{
    const answer= await getAnswer(input);
    if (answer=== undefined){
      return unansweredResult("cancelled");
    }
    return answeredResult(answer);
  }catch{
    return unansweredResult("unavailable");
  }
}







