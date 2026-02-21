import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait, paths } from "../src/index.js"

Deno.test("paths returns empty array when no traits match", () => {
  const container = createContainer()
  const foo = addSlot(container)

  assertEquals(paths(foo)(container)(42), [])
})

Deno.test("paths returns one path when a predicate trait matches", () => {
  const container = createContainer()
  const foo = addSlot(container)

  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  const result = paths(foo)(container)([1, 2, 3])
  assertEquals(result.length, 1)
})

Deno.test("paths returns empty array when predicate does not match value", () => {
  const container = createContainer()
  const foo = addSlot(container)

  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  assertEquals(paths(foo)(container)(42), [])
})

Deno.test("paths resolves through slot-based trait dependencies", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)

  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)

  defineTrait({
    requires: [toIterable],
    provides: [[map, proxy => fn => [...toIterable(proxy)].map(fn)]]
  })(container)

  const result = paths(map)(container)([1, 2, 3])
  assertEquals(result.length, 1)
  assertEquals(result[0].length, 2)
})