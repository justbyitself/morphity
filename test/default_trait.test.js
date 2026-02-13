import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, addToTrait, typeOf } from "../src/index.js"
import { cond } from "./test_helpers.js"

Deno.test("add slot to defaultTrait with dispatch logic", () => {
  const container = createContainer()
  const draw = addSlot(container)
  
  const drawDispatcher = cond([
    [Array.isArray, proxy => `Array with ${proxy.length}`],
    [() => true, proxy => 'Other']
  ])
  
  addToTrait([[draw, drawDispatcher]])(container.defaultTrait)
  
  assertEquals(draw([1, 2, 3]), 'Array with 3')
  assertEquals(draw({ name: "obj" }), 'Other')
})

Deno.test("defaultTrait dispatches based on predicates", () => {
  const container = createContainer()
  const getType = addSlot(container)
  
  const typeDispatcher = cond([
    [Array.isArray, proxy => 'array'],
    [proxy => typeOf(proxy) === 'string', proxy => 'string'],
    [() => true, proxy => 'other']
  ])
  
  addToTrait([[getType, typeDispatcher]])(container.defaultTrait)
  
  assertEquals(getType([1, 2, 3]), 'array')
  assertEquals(getType('hello'), 'string')
  assertEquals(getType({ a: 1 }), 'other')
})

Deno.test("slot throws if no predicate matches in defaultTrait", () => {
  const container = createContainer()
  const strict = addSlot(container)
  
  const strictDispatcher = cond([
    [Array.isArray, proxy => 'array']
  ])
  
  addToTrait([[strict, strictDispatcher]])(container.defaultTrait)
  
  assertThrows(() => {
    strict({ a: 1 })
  })
})

Deno.test("defaultTrait can be extended like any other trait", () => {
  const container = createContainer()
  const slot1 = addSlot(container)
  const slot2 = addSlot(container)
  
  addToTrait([[slot1, proxy => 'Slot 1']])(container.defaultTrait)
  addToTrait([[slot2, proxy => 'Slot 2']])(container.defaultTrait)
  
  const obj = {}
  
  assertEquals(slot1(obj), 'Slot 1')
  assertEquals(slot2(obj), 'Slot 2')
})
