import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, addSlotWithDescription, defineTrait, defineTraitWithDescription, traitDescription, explain } from "../src/index.js"

Deno.test("traitDescription returns the description of a named trait", () => {
  const container = createContainer()
  const foo = addSlot(container)

  const trait = defineTraitWithDescription('arrayFoo')({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  assertEquals(traitDescription(trait), 'arrayFoo')
})

Deno.test("traitDescription returns undefined for an anonymous trait", () => {
  const container = createContainer()
  const foo = addSlot(container)

  const trait = defineTrait({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  assertEquals(traitDescription(trait), undefined)
})

Deno.test("explain uses trait description when available", () => {
  const container = createContainer()
  const foo = addSlotWithDescription('foo')(container)

  defineTraitWithDescription('arrayFoo')({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  const result = explain(foo)(container)([1, 2, 3])
  assertStringIncludes(result, 'arrayFoo')
})