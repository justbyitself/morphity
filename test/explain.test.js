import { assertStringIncludes } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, addSlotWithDescription, defineTrait, explain } from "../src/index.js"

Deno.test("explain mentions slot name and value", () => {
  const container = createContainer()
  const foo = addSlotWithDescription('foo')(container)

  const result = explain(foo)(container)(42)
  assertStringIncludes(result, 'foo')
  assertStringIncludes(result, '42')
})

Deno.test("explain reports no paths found when no traits match", () => {
  const container = createContainer()
  const foo = addSlotWithDescription('foo')(container)

  const result = explain(foo)(container)(42)
  assertStringIncludes(result, 'No paths found')
})

Deno.test("explain describes a path when a predicate trait matches", () => {
  const container = createContainer()
  const foo = addSlotWithDescription('foo')(container)

  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  const result = explain(foo)(container)([1, 2, 3])
  assertStringIncludes(result, 'Path 1')
  assertStringIncludes(result, 'predicate trait')
  assertStringIncludes(result, 'foo')
})

Deno.test("explain describes a multi-step path through slot-based traits", () => {
  const container = createContainer()
  const toIterable = addSlotWithDescription('toIterable')(container)
  const map = addSlotWithDescription('map')(container)

  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)

  defineTrait({
    requires: [toIterable],
    provides: [[map, proxy => fn => [...toIterable(proxy)].map(fn)]]
  })(container)

  const result = explain(map)(container)([1, 2, 3])
  assertStringIncludes(result, 'Path 1')
  assertStringIncludes(result, 'toIterable')
  assertStringIncludes(result, 'map')
})