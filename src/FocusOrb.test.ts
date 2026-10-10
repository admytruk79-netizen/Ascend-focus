import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {createElement} from "react";
import {FocusOrb} from "./FocusOrb";
describe("focus motion accessibility",()=>{
 it("provides meaningful static progress without JavaScript animation",()=>{
  const html=renderToStaticMarkup(createElement(FocusOrb,{progress:.5,running:false}));
  expect(html).toContain("Practice progress 50 percent");
  expect(html).toContain('stroke-dashoffset="0.5"');
 });
 it("clamps out-of-range progress",()=>{
  const html=renderToStaticMarkup(createElement(FocusOrb,{progress:5,running:true}));
  expect(html).toContain("Practice progress 100 percent");
  expect(html).toContain('stroke-dashoffset="0"');
 });
});
