import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait } from "../src/index.js"

Deno.test("resolveFor returns paths to reach a slot", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  defineTrait({
    requires: [toIterable],
    provides: [[map, proxy => fn => {
      const result = []
      for (const item of toIterable(proxy)) result.push(fn(item))
      return result
    }]]
  })(container)
  
  const item = {
    value: [1, 2, 3],
    customSlots: new Map()
  }
  
  const paths = container.traitRegistry.resolveFor(item, map.id)
  
  assertEquals(paths.length, 1)
  assertEquals(paths[0].length, 2)
})

Deno.test("resolveFor returns multiple paths for different predicates", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  defineTrait({
    requires: value => typeof value === 'string',
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  defineTrait({
    requires: [toIterable],
    provides: [[map, proxy => fn => {
      const result = []
      for (const item of toIterable(proxy)) result.push(fn(item))
      return result
    }]]
  })(container)
  
  const arrayItem = {
    value: [1, 2, 3],
    customSlots: new Map()
  }
  
  const arrayPaths = container.traitRegistry.resolveFor(arrayItem, map.id)
  assertEquals(arrayPaths.length, 1)
  
  const stringItem = {
    value: "hello",
    customSlots: new Map()
  }
  
  const stringPaths = container.traitRegistry.resolveFor(stringItem, map.id)
  assertEquals(stringPaths.length, 1)
})

Deno.test("resolveFor returns empty array when no path exists", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  const item = {
    value: [1, 2, 3],
    customSlots: new Map()
  }
  
  const paths = container.traitRegistry.resolveFor(item, map.id)
  assertEquals(paths.length, 0)
})

Deno.test("map slot works with lazy resolution", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  defineTrait({
    requires: [toIterable],
    provides: [[map, proxy => fn => {
      const result = []
      for (const item of toIterable(proxy)) result.push(fn(item))
      return result
    }]]
  })(container)
  
  const result = map([1, 2, 3])(x => x * 2)
  
  assertEquals(result, [2, 4, 6])
})
