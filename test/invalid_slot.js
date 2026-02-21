import { assertThrows, assertStringIncludes } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, defineTrait } from "../src/index.js"
import { InvalidSlotError } from "../src/errors.js"

Deno.test("throws InvalidSlotError when a string is passed as slot", () => {
  const container = createContainer()

  assertThrows(
    () => defineTrait({
      requires: value => Array.isArray(value),
      provides: [["notASlot", () => 'array']]
    })(container),
    InvalidSlotError
  )
})

Deno.test("throws InvalidSlotError when undefined is passed as slot", () => {
  const container = createContainer()

  assertThrows(
    () => defineTrait({
      requires: value => Array.isArray(value),
      provides: [[undefined, () => 'array']]
    })(container),
    InvalidSlotError
  )
})

Deno.test("throws InvalidSlotError when a plain object is passed as slot", () => {
  const container = createContainer()

  assertThrows(
    () => defineTrait({
      requires: value => Array.isArray(value),
      provides: [[{ id: 'notASymbol' }, () => 'array']]
    })(container),
    InvalidSlotError
  )
})

Deno.test("InvalidSlotError detail mentions addSlot", () => {
  const container = createContainer()

  const error = assertThrows(
    () => defineTrait({
      requires: value => Array.isArray(value),
      provides: [["notASlot", () => 'array']]
    })(container),
    InvalidSlotError
  )

  assertStringIncludes(error.detail, 'addSlot')
})

Deno.test("does not throw when a valid slot is passed", () => {
  const container = createContainer()
  const foo = addSlot(container)

  defineTrait({
    requires: value => Array.isArray(value),
    provides: [[foo, () => 'array']]
  })(container)
})