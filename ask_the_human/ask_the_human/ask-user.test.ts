import {describe,expect, it} from "vitest";
import{askUser} from "./ask-user.js";

describe("askUser",()=> {
  it("returns the human answer", async()=>{
    const input={
      question: "Which color should we use?",
      reason:"The user has not chosen a color.",
      options:["Blue","Green"]
  };
  const getAnswer= async()=> "Blue";
  const result= await askUser(input, getAnswer);
  expect (result).toEqual({
    status:"answered",
    answer:"Blue",
  });
});
it ("returns unanswered when the user cancels", async()=>{
  const input={
    question:"Which color should we use?",
    reason:"The user has not chosen a color.",
    options:["Blue","Green"],
  };
  const getAnswer=async ()=> undefined;
  const result= await askUser(input,getAnswer);

  expect (result).toEqual({
    status: "unanswered",
    reason:"cancelled",
  });
  it ("returns unanswered when the UI is unavailable", async()=>{
    const input={
      question:"Which color should we use?",
      reason:"The user has not chosen a color.",
      options: ["Blue","Green"],
    };
    const getAnswer= async(): Promise<string>=>{
      throw new Error("UI unavailable");
    };
    const result= await askUser(input,getAnswer);
    expect(result).toEqual({
      status:"unanswered",
      reason:"unavailable",
    });
    
});
    
