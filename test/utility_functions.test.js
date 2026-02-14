import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { typeOf, equalsTo } from "../src/index.js"

Deno.test("typeOf returns correct type for primitives", () => {
  assertEquals(typeOf('hello'), 'string')
  assertEquals(typeOf(42), 'number')
  assertEquals(typeOf(true), 'boolean')
})

Deno.test("typeOf returns correct type for objects", () => {
  assertEquals(typeOf({}), 'object')
  assertEquals(typeOf([]), 'object')
  assertEquals(typeOf(null), 'object')
})

Deno.test("equalsTo compares primitives correctly", () => {
  assertEquals(equalsTo('hello')('hello'), true)
  assertEquals(equalsTo('hello')('world'), false)
  assertEquals(equalsTo(42)(42), true)
  assertEquals(equalsTo(42)(43), false)
})

Deno.test("equalsTo compares objects by reference", () => {
  const obj1 = { name: 'test' }
  const obj2 = { name: 'test' }
  
  assertEquals(equalsTo(obj1)(obj1), true)
  assertEquals(equalsTo(obj1)(obj2), false)
})
