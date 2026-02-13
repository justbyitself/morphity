import { isUndefined } from './utils.js'
import { ensureItemProxy } from './items.js'

const createSlotFunc = (slotId, container) => (value) => {
  const result = ensureItemProxy(value, container)[slotId]
  if (isUndefined(result)) throw new Error("Slot not implemented")
  return result
}

export const addSlot = (container) => {
  const slotId = Symbol()
  const slotFunc = createSlotFunc(slotId, container)
  slotFunc.id = slotId
  return slotFunc
}
