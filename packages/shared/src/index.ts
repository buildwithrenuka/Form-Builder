// ── Shared types used across web, mobile and api ─────────────────────────

export type User = {
  id: string
  name: string
  email: string
}

export type ApiResponse<T> = {
  data: T
  success: boolean
  message: string
}

// ── Form visibility modes ─────────────────────────────────────────────────
export type FormVisibility = 'public' | 'unlisted'

// ── Public form summary (for explore/gallery pages) ───────────────────────
export type PublicFormSummary = {
  id: string
  title: string
  description: string | null
  slug: string
  worldTheme: string | null
  createdAt: Date
}

// ── Field types supported by the form builder ─────────────────────────────
export type FieldType =
  | 'text' | 'email' | 'phone' | 'number' | 'textarea'
  | 'select' | 'multi_select' | 'radio' | 'checkbox' | 'rating' | 'date'
  | 'url' | 'currency' | 'file' | 'section_divider' | 'scale'
  | 'pan' | 'gst' | 'ifsc' | 'pincode'

export type FormField = {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  halfWidth?: boolean
  options?: string[]
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  helpText?: string
}

// ── API router type (re-exported for type-safe tRPC client) ───────────────
// Usage in web/mobile:
//   import type { AppRouter } from '@repo/shared'
//   const trpc = createTRPCReact<AppRouter>()
export type { AppRouter } from '../../apps/api/src/index'
