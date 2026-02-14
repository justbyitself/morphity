# Morphity

A functional, trait-based polymorphism system for JavaScript/TypeScript using proxies and symbols.

## Quick Start

```javascript
import { createContainer, addSlot, defineTrait } from 'jsr:@justbyitself/morphity'

// Create a container
const container = createContainer()

// Define slots
const toIterable = addSlot(container)
const map = addSlot(container)

// Define traits declaratively
defineTrait({
  requires: value => Array.isArray(value),
  provides: [[toIterable, proxy => proxy]]
})(container)

defineTrait({
  requires: [toIterable],
  provides: [[map, proxy => fn => {
    const result = []
    for (const item of toIterable(proxy)) result.push(fn(item))
    return result
  }]]
})(container)

// Use it - traits auto-apply!
map([1, 2, 3])(x => x * 2)  // [2, 4, 6]
```

## Features

- **Slot-based polymorphism** - Define behaviors through slots
- **Auto-applying traits** - Traits apply automatically based on predicates and dependencies
- **Composable traits** - Build complex behaviors from simple traits
- **Data-last support** - Built-in support for functional pipelines with `addSlotWithArity`
- **Dependency resolution** - Automatic path finding and cycle detection
- **Zero dependencies** - Pure JavaScript with no external dependencies

## Documentation

See [GUIDE.md](https://github.com/justbyitself/morphity/blob/main/GUIDE.md) for detailed documentation and examples.

