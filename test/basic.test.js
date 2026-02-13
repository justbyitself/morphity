import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot } from "../src/index.js"

Deno.test("createContainer returns an object", () => {
  const container = createContainer()
  assertEquals(typeof container, "object")
})

Deno.test("container has a defaultTrait", () => {
  const container = createContainer()
  assertEquals(typeof container.defaultTrait, "object")
})

Deno.test("addSlot returns a function", () => {
  const container = createContainer()
  const slot = addSlot(container)
  assertEquals(typeof slot, "function")
})

Deno.test("slot has a unique symbol identifier", () => {
  const container = createContainer()
  const slot1 = addSlot(container)
  const slot2 = addSlot(container)
  
  assertEquals(typeof slot1.id, "symbol")
  assertEquals(typeof slot2.id, "symbol")
  assertEquals(slot1.id === slot2.id, false)
})

Deno.test("calling slot on object without trait throws error", () => {
  const container = createContainer()
  const draw = addSlot(container)
  
  const obj = { name: "circle" }
  
  assertThrows(() => {
    draw(obj)
  }, Error, "Slot not implemented")
})
