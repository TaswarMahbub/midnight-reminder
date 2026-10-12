export type AskUserInput = {
  question: string;
  reason: string;
  options: string[];
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

  
