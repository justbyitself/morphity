import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait } from "../src/index.js"

Deno.test("trait with multiple slot requirements", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const compare = addSlot(container)
  const sort = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[compare, proxy => (a, b) => a - b]]
  })(container)
  
  defineTrait({
    requires: [toIterable, compare],
    provides: [[sort, proxy => proxy.sort(proxy.compare)]]
  })(container)
  
  const item = {
    value: [3, 1, 2],
    customSlots: new Map()
  }
  
  const paths = container.resolver.resolveFor(item, sort.id)
  
  assertEquals(paths.length, 1)
  assertEquals(paths[0].length, 3)
})

Deno.test("long path with multiple intermediate slots", () => {
  const container = createContainer()
  const slotA = addSlot(container)
  const slotB = addSlot(container)
  const slotC = addSlot(container)
  const slotD = addSlot(container)
  
  defineTrait({
    requires: value => typeof value === 'string',
    provides: [[slotA, proxy => 'A']]
  })(container)
  
  defineTrait({
    requires: [slotA],
    provides: [[slotB, proxy => 'B']]
  })(container)
  
  defineTrait({
    requires: [slotB],
    provides: [[slotC, proxy => 'C']]
  })(container)
  
  defineTrait({
    requires: [slotC],
    provides: [[slotD, proxy => 'D']]
  })(container)
  
  const item = {
    value: "hello",
    customSlots: new Map()
  }
  
  const paths = container.resolver.resolveFor(item, slotD.id)
  
  assertEquals(paths.length, 1)
  assertEquals(paths[0].length, 4)
})

Deno.test("detect circular dependencies", () => {
  const container = createContainer()
  const slotA = addSlot(container)
  const slotB = addSlot(container)
  
  defineTrait({
    requires: [slotB],
    provides: [[slotA, proxy => 'A']]
  })(container)
  
  assertThrows(() => {
    defineTrait({
      requires: [slotA],
      provides: [[slotB, proxy => 'B']]
    })(container)
  }, Error)
})

Deno.test("multiple paths to same slot - choose shortest", () => {
  const container = createContainer()
  const slotA = addSlot(container)
  const slotB = addSlot(container)
  const target = addSlot(container)
  
  defineTrait({
    requires: value => typeof value === 'number',
    provides: [[slotA, proxy => 'A']]
  })(container)
  
  defineTrait({
    requires: [slotA],
    provides: [[target, proxy => 'short']]
  })(container)
  
  defineTrait({
    requires: [slotA],
    provides: [[slotB, proxy => 'B']]
  })(container)
  
  defineTrait({
    requires: [slotB],
    provides: [[target, proxy => 'long']]
  })(container)
  
  const item = {
    value: 42,
    customSlots: new Map()
  }
  
  const paths = container.resolver.resolveFor(item, target.id)
  
  assertEquals(paths.length >= 1, true)
  assertEquals(paths[0].length, 2)
})
