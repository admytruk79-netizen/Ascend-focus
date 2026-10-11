import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {createElement} from "react";
import {GuidedSteps} from "./GuidedSteps";
describe("guided exercise steps",()=>{
 it("shows one current instruction and explicit navigation",()=>{
  const html=renderToStaticMarkup(createElement(GuidedSteps,{exerciseId:"sample",steps:["Prepare","Observe","Reflect"]}));
  expect(html).toContain("STEP 1 OF 3");
  expect(html).toContain("Prepare");
  expect(html).not.toContain(">Observe<");
  expect(html).toContain("Next step");
  expect(html).toContain("Instruction progress");
 });
});
