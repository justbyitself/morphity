import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait, traits, provides, requires } from "../src/index.js"

Deno.test("traits returns empty array for a new container", () => {
  const container = createContainer()

  assertEquals(traits(container), [])
})

Deno.test("traits returns all traits registered in the container", () => {
  const container = createContainer()
  const foo = addSlot(container)

  const trait = defineTrait({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  assertEquals(traits(container), [trait])
})

Deno.test("provides returns the slots provided by a trait", () => {
  const container = createContainer()
  const foo = addSlot(container)
  const bar = addSlot(container)

  const trait = defineTrait({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'foo'], [bar, () => 'bar']]
  })(container)

  assertEquals(provides(trait), [foo, bar])
})

Deno.test("requires returns the predicate for a predicate trait", () => {
  const container = createContainer()
  const foo = addSlot(container)
  const predicate = value => Array.isArray(value)

  const trait = defineTrait({
    requires: predicate,
    provides: [[foo, () => 'array']]
  })(container)

  assertEquals(requires(trait), predicate)
})

Deno.test("requires returns the slots for a slot-based trait", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)

  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)

  const trait = defineTrait({
    requires: [toIterable],
    provides: [[map, proxy => fn => [...toIterable(proxy)].map(fn)]]
  })(container)

  assertEquals(requires(trait), [toIterable])
})