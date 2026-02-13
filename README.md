# Morphity

A functional, trait-based polymorphism system for JavaScript using proxies and symbols.

## Quick Start

```javascript
import { createContainer, addSlot, addToTrait } from 'jsr:@justbyitself/morphity'

// Create a container
const container = createContainer()

// Define a slot
const draw = addSlot(container)

// Add implementation to defaultTrait
addToTrait([[
  draw, 
  proxy => Array.isArray(proxy) 
    ? `Drawing array with ${proxy.length} items`
    : `Drawing ${typeof proxy}`
]])(container.defaultTrait)

// Use it
draw([1, 2, 3]) // "Drawing array with 3 items"
draw("hello")   // "Drawing string"
```

## Features

- **Slot-based polymorphism** - Define behaviors through slots
- **Composable traits** - Mix and match traits on any value
- **Primitive support** - Works seamlessly with primitives and objects
- **Functional style** - Clean, declarative API
- **Zero dependencies** - Pure JavaScript with proxies

## Documentation

See [GUIDE.md](./GUIDE.md) for detailed documentation and examples.

