import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait, addToTrait, addTrait } from "../src/index.js"
import { cond } from "./test_helpers.js"

Deno.test("define custom trait and apply to object", () => {
  const container = createContainer()
  const draw = addSlot(container)
  
  const customTrait = defineTrait(container)
  addToTrait([[draw, proxy => `Custom drawing ${proxy.name}`]])(customTrait)
  
  const obj = { name: 'circle' }
  const applyCustom = addTrait(customTrait)
  const proxy = applyCustom(obj)
  
  assertEquals(draw(proxy), 'Custom drawing circle')
})

Deno.test("custom trait overrides defaultTrait", () => {
  const container = createContainer()
  const draw = addSlot(container)
  
  const defaultDrawer = cond([
    [() => true, proxy => 'Default drawing']
  ])
  addToTrait([[draw, defaultDrawer]])(container.defaultTrait)
  
  const customTrait = defineTrait(container)
  addToTrait([[draw, proxy => `Custom: ${proxy.name}`]])(customTrait)
  
  const obj = { name: 'circle' }
  
  assertEquals(draw(obj), 'Default drawing')
  
  const applyCustom = addTrait(customTrait)
  const proxy = applyCustom(obj)
  assertEquals(draw(proxy), 'Custom: circle')
})

Deno.test("custom trait can implement multiple slots", () => {
  const container = createContainer()
  const draw = addSlot(container)
  const onClick = addSlot(container)
  
  const multiTrait = defineTrait(container)
  addToTrait([
    [draw, proxy => `Drawing ${proxy.name}`],
    [onClick, proxy => `Clicked ${proxy.name}`]
  ])(multiTrait)
  
  const obj = { name: 'button' }
  const applyMulti = addTrait(multiTrait)
  const proxy = applyMulti(obj)
  
  assertEquals(draw(proxy), 'Drawing button')
  assertEquals(onClick(proxy), 'Clicked button')
})
