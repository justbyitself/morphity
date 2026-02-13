# Morphity Guide

A comprehensive guide to understanding and using Morphity's trait-based polymorphism system.

## Core Concepts

### Containers

A container holds the registry of items and their trait implementations.

```javascript
import { createContainer } from '@justbyitself/morphity'

const container = createContainer()
```

### Slots

Slots define polymorphic operations. Think of them as method signatures that can have different implementations for different values.

```javascript
import { addSlot } from '@justbyitself/morphity'

const draw = addSlot(container)
const area = addSlot(container)
const perimeter = addSlot(container)
```

### Traits

Traits are collections of slot implementations. They define behavior for values.

#### Default Trait

Every container has a default trait that applies to all values.

```javascript
import { addToTrait } from '@justbyitself/morphity'

// Add implementation to default trait
addToTrait([[
  draw,
  proxy => `Drawing ${typeof proxy}`
]])(container.defaultTrait)

draw("hello")  // "Drawing string"
draw(42)       // "Drawing number"
```

#### Custom Traits

Create custom traits for specific types or use cases.

```javascript
import { defineTrait, addTrait } from '@justbyitself/morphity'

const shapeTrait = defineTrait(container)

addToTrait([
  [draw, proxy => `Drawing ${proxy.type} at (${proxy.x}, ${proxy.y})`],
  [area, proxy => proxy.width * proxy.height]
])(shapeTrait)

const rect = { type: 'rectangle', x: 10, y: 20, width: 50, height: 30 }
const shapeRect = addTrait(shapeTrait)(rect)

draw(shapeRect)  // "Drawing rectangle at (10, 20)"
area(shapeRect)  // 1500
```

### Composing Traits

Traits can be composed by applying them sequentially.

```javascript
const drawable = defineTrait(container)
addToTrait([[draw, proxy => `Drawing ${proxy.name}`]])(drawable)

const clickable = defineTrait(container)
addToTrait([[onClick, proxy => `Clicked ${proxy.name}`]])(clickable)

const button = { name: 'Submit' }
const interactiveButton = addTrait(clickable)(addTrait(drawable)(button))

draw(interactiveButton)     // "Drawing Submit"
onClick(interactiveButton)  // "Clicked Submit"
```

## Working with Primitives

Morphity handles primitives transparently.

```javascript
const toUpper = addSlot(container)
addToTrait([[toUpper, proxy => proxy.toUpperCase()]])(container.defaultTrait)

toUpper("hello")  // "HELLO"
```

Primitive methods are automatically bound:

```javascript
const len = addSlot(container)
addToTrait([[len, proxy => proxy.length]])(container.defaultTrait)

len("hello")     // 5
len([1, 2, 3])   // 3
```

## Helpers

### typeOf

Get the actual type of a value, even if wrapped in a proxy.

```javascript
import { typeOf } from '@justbyitself/morphity'

typeOf("hello")  // "string"
typeOf(42)       // "number"
typeOf([])       // "object"
```

### equalsTo

Compare values correctly, unwrapping proxies.

```javascript
import { equalsTo } from '@justbyitself/morphity'

equalsTo(42)(42)        // true
equalsTo("hi")("bye")   // false
```

## Best Practices

### Use descriptive slot names

```javascript
const calculateArea = addSlot(container)
const renderToCanvas = addSlot(container)
```

### Group related slots in traits

```javascript
const geometryTrait = defineTrait(container)
addToTrait([
  [area, /* ... */],
  [perimeter, /* ... */],
  [centroid, /* ... */]
])(geometryTrait)
```

### Leverage the default trait for common behavior

```javascript
// Default behavior for all values
addToTrait([[
  serialize,
  proxy => JSON.stringify(proxy)
]])(container.defaultTrait)
```

### Compose traits for flexibility

```javascript
const entity = addTrait(renderable)(
  addTrait(collidable)(
    addTrait(movable)(obj)
  )
)
```

## Advanced Patterns

### Trait inheritance

Traits can be incrementally extended.

```javascript
const baseTrait = defineTrait(container)
addToTrait([[draw, proxy => 'Base drawing']])(baseTrait)

// Extend with more slots
addToTrait([[onClick, proxy => 'Base click']])(baseTrait)
addToTrait([[onHover, proxy => 'Base hover']])(baseTrait)
```

## Performance Notes

- Proxies add minimal overhead
- Slot lookups are fast (Map-based)
- Traits are applied once, not on every access
- Primitive delegation is optimized
