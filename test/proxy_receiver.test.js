import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait } from "../src/index.js"

Deno.test("proxy preserves this binding for Set methods", () => {
  const container = createContainer()
  const mySlot = addSlot(container)
  
  defineTrait({
    requires: value => value instanceof Set,
    provides: [[mySlot, () => "works"]]
  })(container)
  
  const set = new Set([1, 2, 3])
  mySlot(set)  // applies trait, creates proxy
  
  // Should not throw - methods should work on proxied set
  const values = Array.from(set.values())
  assertEquals(values, [1, 2, 3])
  
  const size = set.size
  assertEquals(size, 3)
})

Deno.test("proxy preserves this binding for Map methods", () => {
  const container = createContainer()
  const mySlot = addSlot(container)
  
  defineTrait({
    requires: value => value instanceof Map,
    provides: [[mySlot, () => "works"]]
  })(container)
  
  const map = new Map([['a', 1], ['b', 2]])
  mySlot(map)  // applies trait, creates proxy
  
  // Should not throw
  const entries = Array.from(map.entries())
  assertEquals(entries, [['a', 1], ['b', 2]])
  
  assertEquals(map.get('a'), 1)
  assertEquals(map.size, 2)
})
