/**
 * Type-only exports for use in type-only imports
 * Usage: import type { UseVoiceRecognitionOptions } from '@/hooks/types-only'
 *
 * This file helps with tree-shaking and ensures zero runtime overhead
 * when you only need types.
 */

export type {
  UseVoiceRecognitionOptions,
  UseVoiceRecognitionReturn,
} from './use-voice-recognition'

export type {
  UseIntakeMemoryOptions,
  UseIntakeMemoryReturn,
  IntakeMemoryEntry,
  IntakeSource,
} from './use-intake-memory'

export type { ParseResult, StepConfig } from './use-smart-parser'

export type {
  IntakeMemoryRow,
  IntakeFlowType,
  IntakeFieldType,
  NormalizedIntakeData,
} from './types'
