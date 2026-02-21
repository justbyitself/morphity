import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { createContainer, addSlot, addSlotWithDescription, description, slots } from "../src/index.js"

Deno.test("description returns undefined for anonymous slot", () => {
  const container = createContainer()
  const foo = addSlot(container)

  assertEquals(description(foo), undefined)
})

Deno.test("description returns the description of a named slot", () => {
  const container = createContainer()
  const foo = addSlotWithDescription('foo')(container)

  assertEquals(description(foo), 'foo')
})

Deno.test("slots returns empty array for a new container", () => {
  const container = createContainer()

  assertEquals(slots(container), [])
})

Deno.test("slots returns all slots added to the container", () => {
  const container = createContainer()
  const foo = addSlot(container)
  const bar = addSlot(container)

  assertEquals(slots(container), [foo, bar])
})

Deno.test("slots only returns slots from the given container", () => {
  const container1 = createContainer()
  const container2 = createContainer()
  const foo = addSlot(container1)
  addSlot(container2)

  assertEquals(slots(container1), [foo])
})