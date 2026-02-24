import type { ConditionGrade } from '@app-types/product'

/**
 * Maps source-specific condition names to Pedie's standard grades (Reebelo-based).
 *
 * Pedie grades: acceptable | good | excellent | premium
 *
 * Source mappings:
 * - Reebelo: acceptable, good, excellent, premium (1:1)
 * - Swappa: fair → acceptable, good → good, mint → excellent, new → premium
 * - Back Market: fair → acceptable, good → good, excellent → excellent, premium → premium, stallone → premium
 */

const SWAPPA_MAP: Record<string, ConditionGrade> = {
  fair: 'acceptable',
  good: 'good',
  mint: 'excellent',
  new: 'premium',
}

const BACK_MARKET_MAP: Record<string, ConditionGrade> = {
  fair: 'acceptable',
  good: 'good',
  excellent: 'excellent',
  premium: 'premium',
  stallone: 'premium',
}

const REEBELO_MAP: Record<string, ConditionGrade> = {
  acceptable: 'acceptable',
  good: 'good',
  excellent: 'excellent',
  premium: 'premium',
}

const SOURCE_MAPS: Record<string, Record<string, ConditionGrade>> = {
  swappa: SWAPPA_MAP,
  backmarket: BACK_MARKET_MAP,
  'back market': BACK_MARKET_MAP,
  reebelo: REEBELO_MAP,
}

/**
 * Maps a condition string from a source marketplace to Pedie's ConditionGrade.
 *
 * @param condition - The source-specific condition string (case-insensitive)
 * @param source - The source marketplace name (e.g., 'swappa', 'reebelo', 'backmarket')
 * @returns The mapped ConditionGrade, or 'good' as a safe default
 */
export function mapConditionToPedie(
  condition: string,
  source: string
): ConditionGrade {
  const normalizedCondition = condition.toLowerCase().trim()
  const normalizedSource = source.toLowerCase().trim()

  const sourceMap = SOURCE_MAPS[normalizedSource]
  if (sourceMap) {
    const mapped = sourceMap[normalizedCondition]
    if (mapped) return mapped
  }

  // Fallback: try direct match against Pedie grades
  const PEDIE_GRADES: ConditionGrade[] = [
    'acceptable',
    'good',
    'excellent',
    'premium',
  ]
  if (PEDIE_GRADES.includes(normalizedCondition as ConditionGrade)) {
    return normalizedCondition as ConditionGrade
  }

  return 'good'
}
