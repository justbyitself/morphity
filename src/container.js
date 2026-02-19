import { createTraitRegistry } from './trait-registry.js'

/** Creates a new runtime context that holds slots, traits, and items. */
export const createContainer = () => {
  const container = {
    symbols: {
      isItem: Symbol('isItem'),
      target: Symbol('target')
    },
    items: new Map(),
    traitRegistry: createTraitRegistry()
  }
  
  return container
}
