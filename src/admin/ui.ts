// Shared class-name constants for the admin console UI.
// Keeping these in one place keeps the managers/modals visually consistent.

export const inputCls = 'admin-input'
export const textareaCls = 'admin-textarea'
export const selectCls = 'admin-select'
export const labelCls = 'admin-label'
export const hintCls = 'admin-hint'

export const btn = {
  primary: 'admin-btn admin-btn--primary',
  ghost: 'admin-btn admin-btn--ghost',
  danger: 'admin-btn admin-btn--danger',
  subtle: 'admin-btn admin-btn--subtle',
  primarySm: 'admin-btn admin-btn--primary admin-btn--sm',
  ghostSm: 'admin-btn admin-btn--ghost admin-btn--sm',
  dangerSm: 'admin-btn admin-btn--danger admin-btn--sm',
} as const

export const badge = {
  accent: 'admin-badge admin-badge--accent',
  green: 'admin-badge admin-badge--green',
  amber: 'admin-badge admin-badge--amber',
  red: 'admin-badge admin-badge--red',
  muted: 'admin-badge admin-badge--muted',
} as const
