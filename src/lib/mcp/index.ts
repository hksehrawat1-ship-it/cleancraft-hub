import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";

export default defineMcp({
  name: "clean-craft-os-mcp",
  title: "Clean Craft OS",
  version: "0.1.0",
  instructions:
    "Tools exposed by the Clean Craft OS internal operating system. Use `echo` to verify connectivity.",
  tools: [echoTool],
});
