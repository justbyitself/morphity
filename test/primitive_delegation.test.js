import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, addToTrait } from "../src/index.js"

Deno.test("primitives delegate methods correctly", () => {
  const container = createContainer()
  const draw = addSlot(container)
  
  addToTrait([[draw, proxy => proxy.toUpperCase()]])(container.defaultTrait)
  
  assertEquals(draw('hello'), 'HELLO')
})

Deno.test("primitives delegate properties correctly", () => {
  const container = createContainer()
  const getLength = addSlot(container)
  
  addToTrait([[getLength, proxy => proxy.length]])(container.defaultTrait)
  
  assertEquals(getLength('hello'), 5)
  assertEquals(getLength([1, 2, 3]), 3)
})

Deno.test("number primitives support arithmetic with coercion", () => {
  const container = createContainer()
  const add = addSlot(container)
  
  addToTrait([[add, proxy => proxy + 10]])(container.defaultTrait)
  
  assertEquals(add(5), 15)
})

Deno.test("primitives work with == comparisons", () => {
  const container = createContainer()
  const check = addSlot(container)
  
  addToTrait([[check, proxy => proxy == 'hello']])(container.defaultTrait)
  
  assertEquals(check('hello'), true)
  assertEquals(check('world'), false)
})

Deno.test("primitives work with valueOf", () => {
  const container = createContainer()
  const getValue = addSlot(container)
  
  addToTrait([[getValue, proxy => proxy.valueOf()]])(container.defaultTrait)
  
  assertEquals(getValue('hello'), 'hello')
  assertEquals(getValue(42), 42)
  assertEquals(getValue(true), true)
})
