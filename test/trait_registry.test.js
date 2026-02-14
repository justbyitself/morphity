import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait } from "../src/index.js"

Deno.test("container has traitRegistry", () => {
  const container = createContainer()
  assertEquals(typeof container.traitRegistry, 'object')
  assertEquals(typeof container.traitRegistry.register, 'function')
  assertEquals(typeof container.traitRegistry.resolveFor, 'function')
})

Deno.test("traitRegistry.register stores trait", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  // Should not throw
})

Deno.test("auto-apply traits with toIterable slot", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  const result = toIterable([1, 2, 3])
  
  assertEquals(Array.isArray(result), true)
})

Deno.test("auto-apply fails when trait not registered", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  
  assertThrows(() => {
    toIterable([1, 2, 3])
  }, Error, "Slot not implemented")
})
