import { assertThrows, assertEquals, assertStringIncludes } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait } from "../src/index.js"
import { SlotNotImplementedError } from "../src/errors.js"

Deno.test("throws SlotNotImplementedError when no traits are registered", () => {
  const container = createContainer()
  const foo = addSlot(container)

  assertThrows(
    () => foo(42),
    SlotNotImplementedError
  )
})

Deno.test("throws SlotNotImplementedError when no traits match the value", () => {
  const container = createContainer()
  const foo = addSlot(container)

  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)

  assertThrows(
    () => foo(42),  // 42 is not an array
    SlotNotImplementedError
  )
})

Deno.test("throws SlotNotImplementedError when traits match but don't provide the slot", () => {
  const container = createContainer()
  const foo = addSlot(container)
  const bar = addSlot(container)

  defineTrait({
    requires: value => typeof value === 'number',
    provides: [[foo, () => 'number']]
  })(container)

  assertThrows(
    () => bar(42),  // bar is never provided
    SlotNotImplementedError
  )
})

Deno.test("error message is short and detail contains additional context", () => {
  const container = createContainer()
  const foo = addSlot(container)

  const error = assertThrows(
    () => foo(42),
    SlotNotImplementedError
  )

  // message should be a single line
  const messageLines = error.message.split('\n')
  assertEquals(messageLines.length, 1)

  // detail should exist and contain useful info
  assertStringIncludes(error.detail, 'Trait resolution:')
})