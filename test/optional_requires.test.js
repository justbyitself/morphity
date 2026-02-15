import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait, apply } from "../src/index.js"

Deno.test("defineTrait works without requires - object format", () => {
  const container = createContainer()
  const mySlot = addSlot(container)
  
  const trait = defineTrait({
    provides: [[mySlot, () => "no prerequisites"]]
  })(container)
  
  assertEquals(typeof trait, 'object')
  assertEquals(trait.provides.length, 1)
})

Deno.test("trait without requires can be applied manually", () => {
  const container = createContainer()
  const mySlot = addSlot(container)
  
  const trait = defineTrait({
    provides: [[mySlot, () => "works"]]
  })(container)
  
  const value = {}
  const proxy = apply(trait)(value)
  const result = mySlot(proxy)
  
  assertEquals(result, "works")
})
