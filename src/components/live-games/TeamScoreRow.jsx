export default function TeamScoreRow({ teamName, score }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{teamName}</p>
      <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>
        {score !== null && score !== undefined ? score : '-'}
      </p>
    </div>
  )
}
