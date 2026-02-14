import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, addSlotWithArity, defineTrait } from "../src/index.js"

Deno.test("addSlotWithArity creates data-last slot with arity 2", () => {
  const container = createContainer()
  const map = addSlotWithArity(2)(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[map, proxy => fn => proxy.map(fn)]]
  })(container)
  
  const result = map(x => x * 2)([1, 2, 3])
  
  assertEquals(result, [2, 4, 6])
})

Deno.test("addSlotWithArity creates data-last slot with arity 3", () => {
  const container = createContainer()
  const reduce = addSlotWithArity(3)(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[reduce, proxy => (fn, init) => proxy.reduce(fn, init)]]
  })(container)
  
  const result = reduce((acc, x) => acc + x, 0)([1, 2, 3])
  
  assertEquals(result, 6)
})

Deno.test("addSlotWithArity slot has arity property", () => {
  const container = createContainer()
  const map = addSlotWithArity(2)(container)
  
  assertEquals(map.arity, 2)
})

Deno.test("addSlot still works data-first (retrocompatible)", () => {
  const container = createContainer()
  const map = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[map, proxy => fn => proxy.map(fn)]]
  })(container)
  
  const result = map([1, 2, 3])(x => x * 2)
  
  assertEquals(result, [2, 4, 6])
})

Deno.test("addSlot has no arity property", () => {
  const container = createContainer()
  const slot = addSlot(container)
  
  assertEquals(slot.arity, undefined)
})
