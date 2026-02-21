import { assertStringIncludes } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, addSlotWithDescription, defineTrait, defineTraitWithDescription, explain } from "../src/index.js"

Deno.test("explain reports slot name, value and no paths when no traits match", () => {
  const container = createContainer()
  const foo = addSlotWithDescription('foo')(container)

  const result = explain(foo)(container)(42)
  assertStringIncludes(result, 'Resolving slot "foo" for value: 42')
  assertStringIncludes(result, 'No paths found')
})

Deno.test("explain describes a single-step predicate path", () => {
  const container = createContainer()
  const foo = addSlotWithDescription('foo')(container)

  defineTraitWithDescription('arrayFoo')({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  const result = explain(foo)(container)([1, 2, 3])
  assertStringIncludes(result, 'Resolving slot "foo"')
  assertStringIncludes(result, 'Path 1:')
  assertStringIncludes(result, '1. arrayFoo → provides: [foo]')
})

Deno.test("explain describes a multi-step path in order", () => {
  const container = createContainer()
  const toIterable = addSlotWithDescription('toIterable')(container)
  const map = addSlotWithDescription('map')(container)

  defineTraitWithDescription('arrayIterable')({
    requires: value => Array.isArray(value),
    provides: [[toIterable, proxy => proxy]]
  })(container)

  defineTraitWithDescription('enumerableTrait')({
    requires: [toIterable],
    provides: [[map, proxy => fn => [...toIterable(proxy)].map(fn)]]
  })(container)

  const result = explain(map)(container)([1, 2, 3])
  assertStringIncludes(result, 'Path 1:')
  assertStringIncludes(result, '1. arrayIterable → provides: [toIterable]')
  assertStringIncludes(result, '2. enumerableTrait → provides: [map]')
})

Deno.test("explain uses anonymous for slots without description", () => {
  const container = createContainer()
  const foo = addSlot(container)

  defineTraitWithDescription('arrayFoo')({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  const result = explain(foo)(container)([1, 2, 3])
  assertStringIncludes(result, '1. arrayFoo → provides: [(anonymous)]')
})