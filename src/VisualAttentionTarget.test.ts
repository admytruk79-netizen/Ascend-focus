import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {createElement} from "react";
import {VisualAttentionTarget} from "./VisualAttentionTarget";
describe("visual attention practice",()=>{
 it("starts as a stationary target and offers explicit motion choices",()=>{
  const html=renderToStaticMarkup(createElement(VisualAttentionTarget,{enabled:false}));
  expect(html).toContain("motion-static");
  expect(html).toContain("Static dot");
  expect(html).toContain("Slow horizontal tracking");
  expect(html).toContain("Slow vertical tracking");
  expect(html).toContain("Blink naturally");
 });
 it("pauses motion when practice timer is stopped",()=>{
  const html=renderToStaticMarkup(createElement(VisualAttentionTarget,{enabled:false}));
  expect(html).toContain("paused");
  expect(html).not.toContain("playing");
 });
});
