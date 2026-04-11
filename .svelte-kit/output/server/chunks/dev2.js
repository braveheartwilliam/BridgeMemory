import { i as invariant_violation, d as define_property } from "./constants.js";
function get_error(label) {
  const error = new Error();
  const stack = get_stack();
  if (stack.length === 0) {
    return null;
  }
  stack.unshift("\n");
  define_property(error, "stack", {
    value: stack.join("\n")
  });
  define_property(error, "name", {
    value: label
  });
  return (
    /** @type {Error & { stack: string }} */
    error
  );
}
function get_stack() {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
  const stack = new Error().stack;
  Error.stackTraceLimit = limit;
  if (!stack) return [];
  const lines = stack.split("\n");
  const new_lines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const posixified = line.replaceAll("\\", "/");
    if (line.trim() === "Error") {
      continue;
    }
    if (line.includes("validate_each_keys")) {
      return [];
    }
    if (posixified.includes("svelte/src/internal") || posixified.includes("node_modules/.vite")) {
      continue;
    }
    new_lines.push(line);
  }
  return new_lines;
}
function invariant(condition, message) {
  if (!condition) invariant_violation(message);
}
export {
  get_error as a,
  get_stack as g,
  invariant as i
};
