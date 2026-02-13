import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait, addToTrait, addTrait } from "../src/index.js"

Deno.test("compose multiple traits sequentially", () => {
  const container = createContainer()
  const draw = addSlot(container)
  const onClick = addSlot(container)
  
  const drawableTrait = defineTrait(container)
  addToTrait([[draw, proxy => `Drawing ${proxy.name}`]])(drawableTrait)
  
  const clickableTrait = defineTrait(container)
  addToTrait([[onClick, proxy => `Clicking ${proxy.name}`]])(clickableTrait)
  
  const obj = { name: 'widget' }
  const makeDrawable = addTrait(drawableTrait)
  const makeClickable = addTrait(clickableTrait)
  
  const proxy = makeClickable(makeDrawable(obj))
  
  assertEquals(draw(proxy), 'Drawing widget')
  assertEquals(onClick(proxy), 'Clicking widget')
})

Deno.test("last trait wins on slot conflict", () => {
  const container = createContainer()
  const draw = addSlot(container)
  
  const trait1 = defineTrait(container)
  addToTrait([[draw, proxy => 'Drawing v1']])(trait1)
  
  const trait2 = defineTrait(container)
  addToTrait([[draw, proxy => 'Drawing v2']])(trait2)
  
  const obj = { name: 'test' }
  const apply1 = addTrait(trait1)
  const apply2 = addTrait(trait2)
  
  const proxy = apply2(apply1(obj))
  
  assertEquals(draw(proxy), 'Drawing v2')
})

Deno.test("traits can be extended incrementally", () => {
  const container = createContainer()
  const draw = addSlot(container)
  const onClick = addSlot(container)
  const onHover = addSlot(container)
  
  const myTrait = defineTrait(container)
  
  addToTrait([[draw, proxy => 'Drawing']])(myTrait)
  addToTrait([[onClick, proxy => 'Clicking']])(myTrait)
  addToTrait([[onHover, proxy => 'Hovering']])(myTrait)
  
  const obj = {}
  const apply = addTrait(myTrait)
  const proxy = apply(obj)
  
  assertEquals(draw(proxy), 'Drawing')
  assertEquals(onClick(proxy), 'Clicking')
  assertEquals(onHover(proxy), 'Hovering')
})
