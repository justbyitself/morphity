import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait } from "../src/index.js"

Deno.test("iterable trait with Set - bluetao scenario", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  
  // Trait que reconoce iterables y devuelve identity
  defineTrait({
    requires: value => value != null && typeof value[Symbol.iterator] === 'function',
    provides: [[toIterable, value => value]]  // identity - devuelve el valor tal cual
  })(container)
  
  const set = new Set([1, 2, 3])
  
  // toIterable aplica el trait y devuelve el set (wrapeado en proxy)
  const result = toIterable(set)
  
  // Esto es lo que falla: Array.from necesita iterar el proxy
  const array = Array.from(result)
  
  assertEquals(array, [1, 2, 3])
})

Deno.test("iterable trait with Map - bluetao scenario", () => {
  const container = createContainer()
  const toIterable = addSlot(container)
  
  defineTrait({
    requires: value => value != null && typeof value[Symbol.iterator] === 'function',
    provides: [[toIterable, value => value]]
  })(container)
  
  const map = new Map([['a', 1], ['b', 2]])
  const result = toIterable(map)
  const array = Array.from(result)
  
  assertEquals(array, [['a', 1], ['b', 2]])
})

Deno.test("calling set.values() on proxied set", () => {
  const container = createContainer()
  const mySlot = addSlot(container)
  
  defineTrait({
    requires: value => value instanceof Set,
    provides: [[mySlot, value => value]]  // devuelve el valor (proxy)
  })(container)
  
  const set = new Set([1, 2, 3])
  const proxiedSet = mySlot(set)
  
  // Esto debería funcionar
  const values = Array.from(proxiedSet.values())
  assertEquals(values, [1, 2, 3])
})
