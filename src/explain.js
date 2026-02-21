import { paths } from './container.js'
import { provides, requires } from './traits.js'
import { description } from './slots.js'

const slotName = slot => description(slot) ?? '(anonymous)'

const traitName = trait => {
  if (trait.requiresValue) return `predicate trait`
  const reqNames = (requires(trait) ?? []).map(slotName).join(', ')
  return `slot trait [requires: ${reqNames}]`
}

export const explain = slot => container => value => {
  const slotDesc = slotName(slot)
  const valueDesc = (() => {
    try { return JSON.stringify(value) } catch { return String(value) }
  })()

  const foundPaths = paths(slot)(container)(value)

  const lines = [
    `Resolving slot "${slotDesc}" for value: ${valueDesc}`,
  ]

  if (foundPaths.length === 0) {
    lines.push('  No paths found.')
  } else {
    foundPaths.forEach((path, i) => {
      lines.push(`  Path ${i + 1}:`)
      path.forEach((trait, j) => {
        const provided = provides(trait).map(slotName).join(', ')
        lines.push(`    ${j + 1}. ${traitName(trait)} → provides: [${provided}]`)
      })
    })
  }

  return lines.join('\n')
}