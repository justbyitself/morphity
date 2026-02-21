# Morphity Guide

Morphity provides a trait-based polymorphism system for JavaScript using slots, traits, and automatic dependency resolution.

## Core Concepts

### Containers

A container holds the runtime context for your traits and slots:

```javascript
import { createContainer } from 'jsr:@justbyitself/morphity'

const container = createContainer()
```

### Slots

Slots are polymorphic functions that can have different implementations for different types:

```javascript
import { addSlot } from 'jsr:@justbyitself/morphity'

const draw = addSlot(container)
const onClick = addSlot(container)
```

### Traits

Traits define implementations for slots. Use `defineTrait` to create traits declaratively:

```javascript
import { defineTrait } from 'jsr:@justbyitself/morphity'

// Predicate-based trait (matches on value type)
defineTrait({
  requires: value => Array.isArray(value),
  provides: [[draw, proxy => `Drawing array with ${proxy.length} items`]]
})(container)

// Slot-based trait (requires other slots)
defineTrait({
  requires: [toIterable],  // needs toIterable slot
  provides: [[map, proxy => fn => {
    const result = []
    for (const item of toIterable(proxy)) result.push(fn(item))
    return result
  }]]
})(container)
```

## Basic Usage

### Simple Example

```javascript
const container = createContainer()
const greet = addSlot(container)

// Define trait for strings
defineTrait({
  requires: value => typeof value === 'string',
  provides: [[greet, proxy => `Hello, ${proxy}!`]]
})(container)

// Define trait for objects
defineTrait({
  requires: value => typeof value === 'object' && value.name,
  provides: [[greet, proxy => `Hello, ${proxy.name}!`]]
})(container)

// Auto-applies correct trait
greet("Alice")           // "Hello, Alice!"
greet({ name: "Bob" })   // "Hello, Bob!"
```

### Trait Composition

Build complex behaviors by composing traits:

```javascript
const container = createContainer()
const toIterable = addSlot(container)
const map = addSlot(container)
const filter = addSlot(container)

// Base trait: arrays are iterable
defineTrait({
  requires: value => Array.isArray(value),
  provides: [[toIterable, proxy => proxy]]
})(container)

// Enumerable trait: requires toIterable, provides map and filter
defineTrait({
  requires: [toIterable],
  provides: [
    [map, proxy => fn => {
      const result = []
      for (const item of toIterable(proxy)) result.push(fn(item))
      return result
    }],
    [filter, proxy => pred => {
      const result = []
      for (const item of toIterable(proxy)) {
        if (pred(item)) result.push(item)
      }
      return result
    }]
  ]
})(container)

// Use composed behavior
const doubled = map([1, 2, 3])(x => x * 2)      // [2, 4, 6]
const evens = filter([1, 2, 3, 4])(x => x % 2 === 0)  // [2, 4]
```

## Auto-Application

Traits automatically apply based on:
1. **Predicate matching**: When a value matches a predicate (e.g., `Array.isArray`)
2. **Slot dependencies**: When required slots become available

```javascript
// When you call map([1,2,3]), morphity:
// 1. Detects [1,2,3] is an array
// 2. Applies arrayIterableTrait (provides toIterable)
// 3. Detects toIterable is now available
// 4. Applies enumerableTrait (provides map)
// 5. Executes map
```

This happens lazily - traits only apply when you use a slot.

## Data-Last Support

Morphity slots are data-first by nature. For data-last pipelines, wrap the slot manually:

```javascript
const map = addSlot(container)

defineTrait({
  requires: value => Array.isArray(value),
  provides: [[map, proxy => fn => proxy.map(fn)]]
})(container)

// Data-last wrapper
const mapL = fn => data => map(data)(fn)

mapL(x => x * 2)([1, 2, 3])  // [2, 4, 6]
```

## Advanced: Multiple Requirements

Traits can require multiple slots:

```javascript
const toIterable = addSlot(container)
const compare = addSlot(container)
const sort = addSlot(container)

// Provides toIterable
defineTrait({
  requires: value => Array.isArray(value),
  provides: [[toIterable, proxy => proxy]]
})(container)

// Provides compare
defineTrait({
  requires: value => Array.isArray(value),
  provides: [[compare, proxy => (a, b) => a - b]]
})(container)

// Requires BOTH toIterable and compare
defineTrait({
  requires: [toIterable, compare],
  provides: [[sort, proxy => [...toIterable(proxy)].sort(compare(proxy))]]
})(container)

sort([3, 1, 2])  // [1, 2, 3]
```

## Format Options

`defineTrait` accepts two formats:

**Object format (recommended):**
```javascript
defineTrait({
  requires: value => Array.isArray(value),
  provides: [[slot1, impl1], [slot2, impl2]]
})(container)
```

**Array format (concise):**
```javascript
defineTrait([
  value => Array.isArray(value),
  [[slot1, impl1], [slot2, impl2]]
])(container)
```

## Best Practices

### Use Slots for Required Dependencies

When a trait requires a slot, actually use it:

```javascript
// ✅ GOOD - uses toIterable
defineTrait({
  requires: [toIterable],
  provides: [[map, proxy => fn => {
    const result = []
    for (const item of toIterable(proxy)) result.push(fn(item))
    return result
  }]]
})(container)

// ❌ BAD - declares toIterable but doesn't use it
defineTrait({
  requires: [toIterable],
  provides: [[map, proxy => fn => proxy.map(fn)]]  // uses .map() directly
})(container)
```

### Separate Concerns

Keep traits focused and composable:

```javascript
// ✅ GOOD - separate base and derived traits
defineTrait({
  requires: value => Array.isArray(value),
  provides: [[toIterable, proxy => proxy]]
})(container)

defineTrait({
  requires: [toIterable],
  provides: [[map, /* ... */], [filter, /* ... */]]
})(container)

// ❌ BAD - mixing concerns
defineTrait({
  requires: value => Array.isArray(value),
  provides: [[toIterable, /* ... */], [map, /* ... */]]  // mixed levels
})(container)
```

### Choose the Right Style

Use data-last for pipeline operations, data-first for simple accessors:

```javascript
// Pipeline operations → wrap manually for data-last
const map = addSlot(container)
const mapL = fn => data => map(data)(fn)

// Simple accessors → data-first is fine
const length = addSlot(container)
const first = addSlot(container)
```

## Error Handling

If no trait provides a slot, a `SlotNotImplementedError` is thrown:

```javascript
import { SlotNotImplementedError } from 'jsr:@justbyitself/morphity'

const mySlot = addSlot(container)

try {
  mySlot([1, 2, 3])
} catch (e) {
  if (e instanceof SlotNotImplementedError) {
    console.log(e.message)  // short: slot name and value
    console.log(e.detail)   // verbose: available slots and trait resolution info
  }
}
```

The error exposes:
- `message` — short description, suitable for logs and stack traces
- `detail` — extended context: which slots were available and whether any traits matched
- `slotId` — the Symbol of the slot that failed
- `item` — the internal item object

Always define traits for the types you'll use.

## Cycle Detection

Morphity detects circular dependencies:

```javascript
defineTrait({
  requires: [slotB],
  provides: [[slotA, /* ... */]]
})(container)

defineTrait({
  requires: [slotA],  // Creates cycle: A needs B, B needs A
  provides: [[slotB, /* ... */]]
})(container)  // Error: Circular dependency detected
```

## Reflection & Debugging

Morphity exposes its internal state through a set of reflection functions, useful for understanding trait resolution and debugging unexpected behavior.

### Inspecting Slots

```javascript
import { addSlotWithDescription, description, slots } from 'jsr:@justbyitself/morphity'

const map = addSlotWithDescription('map')(container)

description(map)       // 'map'
slots(container)       // [map, filter, ...]  — all slots registered in this container
hasSlot(map)(container) // true
```

### Inspecting Traits

```javascript
import { defineTraitWithDescription, traits, provides, requires, traitDescription } from 'jsr:@justbyitself/morphity'

const trait = defineTraitWithDescription('arrayMap')({
  requires: [toIterable],
  provides: [[map, proxy => fn => [...toIterable(proxy)].map(fn)]]
})(container)

traitDescription(trait)  // 'arrayMap'
provides(trait)          // [map]
requires(trait)          // [toIterable]
traits(container)        // all traits registered in this container
```

### Inspecting Resolution Paths

```javascript
import { paths } from 'jsr:@justbyitself/morphity'

// Returns all trait paths morphity would use to resolve a slot for a value
paths(map)(container)([1, 2, 3])
// [[arrayIterableTrait, enumerableTrait]]
```

Each path is an ordered array of traits that would be applied in sequence to provide the slot.

### explain

For a human-readable summary of the resolution process, use `explain`:

```javascript
import { explain } from 'jsr:@justbyitself/morphity'

console.log(explain(map)(container)([1, 2, 3]))
// Resolving slot "map" for value: [1,2,3]
//   Path 1:
//     1. arrayIterable → provides: [toIterable]
//     2. arrayMap → provides: [map]
```

If no traits match, `explain` tells you clearly:

```javascript
console.log(explain(map)(container)(42))
// Resolving slot "map" for value: 42
//   No paths found.
```

`explain` is particularly useful when a `SlotNotImplementedError` is thrown and you want to understand why no path was found.