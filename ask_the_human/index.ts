import type {ExtensionAPI} from"@mariozechner/pi-coding-agent";
import {Type} from "@sinclair/typebox";
import{askUser} from "./ask-user.js";

export default function askTheHuman(pi: ExtensionAPI){

pi.registerTool({
  name:"ask_user",
  label:"Ask the Human",
  description: "Ask the user for guidance when an important decision is unclear. ",
  parameters: Type.Object({
    question: Type.String(),
    reason: Type.String(),
    options: Type.Optional(Type.Array(Type.String())),
    recommendation: Type.Optional(Type.String()),
  }),
  execute: async(_id,params,_signal,_update,ctx) => {
    const result =await askUser(params, async(input)=>{
      if(!ctx.hasUI){
        throw new Error("UI unavailable");
      }
      if(!input.options|| input.options.length===0){
        return await ctx.ui.input(input.question);
      }
      return await ctx.ui.select(input.question, input.options);
      
    });
    return{
      content: [{
        type:"text",
        text: result.status ==="answered"
        ?'Human answer: ${result.answer}'
          :'No human answer(${result.reason})',
      }],
      details:result,
     };
  
});
}
