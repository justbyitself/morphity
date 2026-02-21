export class SlotNotImplementedError extends Error {
  constructor(slotId, item, paths) {
    const slotDesc = slotId.description ?? slotId.toString()
    const valueDesc = (() => {
      try { return JSON.stringify(item.value) } catch { return String(item.value) }
    })()
    const availableSlots = [...item.customSlots.keys()]
      .map(s => s.description ?? '?')
      .join(', ') || 'none'
    const traitsMsg = paths.length > 0
      ? 'traits found but did not provide the slot'
      : 'no traits matched'

    super(`Slot "${slotDesc}" not implemented for value: ${valueDesc}`)
    this.name = 'SlotNotImplementedError'
    this.slotId = slotId
    this.item = item
    this.detail =
      `  Available slots on this item: [${availableSlots}]\n` +
      `  Trait resolution: ${traitsMsg}`
  }
}

export class InvalidSlotError extends Error {
  constructor(value) {
    const valueDesc = (() => {
      try { return JSON.stringify(value) } catch { return String(value) }
    })()
    super(`Invalid slot: expected a slot but got: ${valueDesc}`)
    this.name = 'InvalidSlotError'
    this.value = value
    this.detail = `  A slot must be created with addSlot() or addSlotWithDescription()`
  }
}