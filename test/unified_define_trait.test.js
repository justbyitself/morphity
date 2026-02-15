import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait, apply } from "../src/index.js"

Deno.test("defineTrait with object format - predicate trait", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [
      [toIterable, proxy => proxy]
    ]
  })(container)
  
  const result = toIterable([1, 2, 3])
  assertEquals([...result], [1, 2, 3])
})

Deno.test("defineTrait with array format - predicate trait", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  
  defineTrait([
    value => Array.isArray(value),
    [[toIterable, proxy => proxy]]
  ])(container)
  
  const result = toIterable([1, 2, 3])
  assertEquals([...result], [1, 2, 3])
})

Deno.test("defineTrait with object format - slot trait", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  defineTrait({
    requires: [toIterable],
    provides: [
      [map, proxy => fn => {
        // Use the toIterable slot (the requirement)
        const result = []
        for (const item of toIterable(proxy)) {
          result.push(fn(item))
        }
        return result
      }]
    ]
  })(container)
  
  const result = map([1, 2, 3])(x => x * 2)
  assertEquals(result, [2, 4, 6])
})

Deno.test("defineTrait with array format - slot trait", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)
  
  defineTrait([
    value => Array.isArray(value),
    [[toIterable, proxy => proxy]]
  ])(container)
  
  defineTrait([
    [toIterable],
    [[map, proxy => fn => {
      // Use the toIterable slot (the requirement)
      const result = []
      for (const item of toIterable(proxy)) {
        result.push(fn(item))
      }
      return result
    }]]
  ])(container)
  
  const result = map([1, 2, 3])(x => x * 2)
  assertEquals(result, [2, 4, 6])
})

Deno.test("defineTrait with multiple slots in separate traits", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)
  const filter = addSlot(container)
  
  // Base trait: value → toIterable
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  // Enumerable trait: toIterable → map, filter
  defineTrait({
    requires: [toIterable],
    provides: [
      [map, proxy => fn => {
        const result = []
        for (const item of toIterable(proxy)) result.push(fn(item))
        return result
      }],
      [filter, proxy => pred => {
        const result = []
        for (const item of toIterable(proxy)) {
          if (pred(item)) result.push(item)
        }
        return result
      }]
    ]
  })(container)
  
  assertEquals(map([1, 2, 3])(x => x * 2), [2, 4, 6])
  assertEquals(filter([1, 2, 3])(x => x > 1), [2, 3])
})

Deno.test("defineTrait registers trait in registry", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  const map = addSlot(container)
  
  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)
  
  defineTrait({
    requires: [toIterable],
    provides: [[map, proxy => fn => proxy.map(fn)]]
  })(container)
  
  // Should auto-apply traits
  const result = map([1, 2, 3])(x => x * 2)
  assertEquals(result, [2, 4, 6])
})
