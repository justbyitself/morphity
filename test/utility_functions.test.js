import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, addToTrait, typeOf, equalsTo } from "../src/index.js"
import { cond } from "./test_helpers.js"

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
  const container = createContainer()
  
  const obj1 = { name: 'test' }
  const obj2 = { name: 'test' }
  
  assertEquals(equalsTo(obj1)(obj1), true)
  assertEquals(equalsTo(obj1)(obj2), false)
})

Deno.test("typeOf works in cond predicates", () => {
  const container = createContainer()
  const process = addSlot(container)
  
  const processor = cond([
    [proxy => typeOf(proxy) === 'string', proxy => `String: ${proxy}`],
    [proxy => typeOf(proxy) === 'number', proxy => `Number: ${proxy}`],
    [() => true, proxy => 'Other']
  ])
  
  addToTrait([[process, processor]])(container.defaultTrait)
  
  assertEquals(process('hello'), 'String: hello')
  assertEquals(process(42), 'Number: 42')
  assertEquals(process({}), 'Other')
})

Deno.test("instanceof works in predicates with arrays and objects", () => {
  const container = createContainer()
  const foo = addSlot(container)
  
  const fooDispatcher = cond([
    [x => x instanceof Array, proxy => 'Array!!'],
    [() => true, proxy => 'something else']
  ])
  
  addToTrait([[foo, fooDispatcher]])(container.defaultTrait)
  
  assertEquals(foo([]), 'Array!!')
  assertEquals(foo([1, 2, 3]), 'Array!!')
  assertEquals(foo(2), 'something else')
  assertEquals(foo('hello'), 'something else')
  assertEquals(foo({}), 'something else')
})
