// Quel palier est actif pour une catégorie donnée, à partir du seul
// historique — aucun état stocké, rien à cocher à la main.

import { getSessionConfig, isTempoBlock } from '../config/program.js'
import { isAtCap } from './progression.js'

/**
 * Premier palier non acquis de la catégorie (ou le dernier si tous le sont).
 * Un palier est acquis quand TOUS ses blocs à tempo ont atteint leur capBpm
 * avec assez de passages propres d'affilée.
 */
export function getActiveTier(sessions, instrument, sessionType) {
  const config = getSessionConfig(instrument, sessionType)
  if (!config?.tiers?.length) return null

  for (let i = 0; i < config.tiers.length; i++) {
    const tier = config.tiers[i]
    const tempoBlocks = tier.blocks.filter(isTempoBlock)
    const atCap = tempoBlocks.filter((b) => isAtCap(sessions, b.id)).length
    if (atCap < tempoBlocks.length) {
      return { tier, index: i, total: config.tiers.length, acquired: false, blocksAtCap: atCap, tempoBlocks: tempoBlocks.length }
    }
  }
  const last = config.tiers.at(-1)
  const tempoBlocks = last.blocks.filter(isTempoBlock)
  return {
    tier: last,
    index: config.tiers.length - 1,
    total: config.tiers.length,
    acquired: true,
    blocksAtCap: tempoBlocks.length,
    tempoBlocks: tempoBlocks.length,
  }
}

/**
 * Blocs à proposer pour la séance du jour : ceux du palier actif, plus les
 * blocs `continuous` qui s'affichent quel que soit le palier (ils ne
 * bloquent ni ne débloquent rien).
 */
export function getBlocksForDay(sessions, instrument, sessionType) {
  const config = getSessionConfig(instrument, sessionType)
  if (!config) return []
  const active = getActiveTier(sessions, instrument, sessionType)
  return [...(active?.tier.blocks ?? []), ...config.continuous]
}
