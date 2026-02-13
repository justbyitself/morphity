import { isDefined, firstDefined } from './utils.js'

// Base handler functions - each takes what it needs from the context object
const handleItemMarker = ({ container, prop }) => 
  prop === container.symbols.isItem ? true : undefined

const handleTarget = ({ item, container, prop }) =>
  prop === container.symbols.target 
    ? (item.isPrimitive ? item.value : item.target)
    : undefined

const handleToPrimitive = ({ item, prop }) => 
  prop === Symbol.toPrimitive ? (hint) => item.value : undefined

const handleValueOf = ({ item, prop }) =>
  prop === 'valueOf' ? () => item.value : undefined

const handleToString = ({ item, prop }) =>
  prop === 'toString' ? () => String(item.value) : undefined

const handleSlotAccess = ({ item, container, prop }) => {
  const slotId = prop
  const slotImpl = item.customSlots.get(slotId) || container.defaultTrait.slots.get(slotId)
  return slotImpl ? slotImpl(item.proxy) : undefined
}

const handlePrimitiveDelegation = ({ item, prop }) => {
  const primitiveValue = item.value
  const propValue = primitiveValue[prop]
  return typeof propValue === 'function' 
    ? propValue.bind(primitiveValue) 
    : propValue
}

const handleObjectProperty = ({ target, prop }) =>
  Reflect.get(target, prop)

const handleObjectToString = ({ target, prop }) =>
  prop === 'toString' ? target.toString.bind(target) : undefined

// Apply a list of handlers in sequence, returning first defined result
export const applyHandlers = (handlers, context) =>
  firstDefined(...handlers.map(h => () => h(context)))

// Handler configurations
export const primitiveHandlers = [
  handleItemMarker,
  handleTarget,
  handleToPrimitive,
  handleValueOf,
  handleToString,
  handleSlotAccess,
  handlePrimitiveDelegation
]

export const objectHandlers = [
  handleItemMarker,
  handleTarget,
  handleObjectToString,
  handleSlotAccess,
  handleObjectProperty
]
