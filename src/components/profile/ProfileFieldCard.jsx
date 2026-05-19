import { useEffect, useRef, useState } from 'react'

const STATUS_TIMEOUT = 1800

export default function ProfileFieldCard({
  accent = 'accent',
  title,
  hint,
  value,
  onSave,
  type = 'text',
  placeholder = '',
  options,
  maxLength,
  rows,
  preview,
  readOnly,
  displayWhenEmpty = 'not set',
}) {
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => { setDraft(value ?? '') }, [value])
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const dirty = String(draft ?? '') !== String(value ?? '')

  async function handleSave(e) {
    e?.preventDefault?.()
    if (readOnly || !dirty || saving) return
    setSaving(true)
    setStatus(null)
    try {
      const out = type === 'number'
        ? (draft === '' ? null : Number(draft))
        : (typeof draft === 'string' ? (draft.trim() || null) : draft)
      await onSave(out)
      setStatus({ kind: 'ok', text: 'Saved' })
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setStatus(null), STATUS_TIMEOUT)
    } catch (err) {
      setStatus({ kind: 'err', text: err?.message || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className={`profile-field-card profile-field-${accent}${readOnly ? ' is-readonly' : ''}`}
    >
      <div className="profile-field-stripe" />
      <div className="profile-field-body">
        <div className="profile-field-head">
          <h3>{title}</h3>
          {hint && <span className="profile-field-hint">{hint}</span>}
        </div>

        {preview}

        {readOnly ? (
          <p className="profile-field-readonly">
            {value || <em className="profile-field-empty">{displayWhenEmpty}</em>}
          </p>
        ) : (
          <>
            {options ? (
              <select
                className="input profile-field-input"
                value={draft ?? ''}
                onChange={(e) => setDraft(e.target.value)}
                disabled={saving}
              >
                <option value="">{placeholder || 'Select...'}</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : rows ? (
              <textarea
                className="input profile-field-input"
                rows={rows}
                maxLength={maxLength}
                placeholder={placeholder}
                value={draft ?? ''}
                onChange={(e) => setDraft(e.target.value)}
                disabled={saving}
              />
            ) : (
              <input
                className="input profile-field-input"
                type={type}
                maxLength={maxLength}
                placeholder={placeholder}
                value={draft ?? ''}
                onChange={(e) => setDraft(e.target.value)}
                disabled={saving}
              />
            )}

            <div className="profile-field-actions">
              <button
                type="submit"
                className="btn primary profile-field-save"
                disabled={!dirty || saving}
              >
                {saving ? 'Saving...' : dirty ? 'Save' : 'Saved'}
              </button>
              {status && (
                <span className={status.kind === 'ok' ? 'profile-field-ok' : 'profile-field-err'}>
                  {status.text}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </form>
  )
}
