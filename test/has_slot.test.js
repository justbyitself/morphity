import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait, hasSlot } from "../src/index.js"

Deno.test("hasSlot returns true when slot is provided by a predicate trait", () => {
  const container = createContainer()
  const foo = addSlot(container)

  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  assertEquals(hasSlot(foo)(container), true)
})

Deno.test("hasSlot returns true when slot is provided by a slot-based trait", () => {
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

  assertEquals(hasSlot(map)(container), true)
})

Deno.test("hasSlot returns false when slot belongs to a different container", () => {
  const container1 = createContainer()
  const container2 = createContainer()
  const foo = addSlot(container1)

  assertEquals(hasSlot(foo)(container2), false)
})

Deno.test("hasSlot returns true as soon as slot is added to container", () => {
  const container = createContainer()
  const foo = addSlot(container)

  assertEquals(hasSlot(foo)(container), true)
})