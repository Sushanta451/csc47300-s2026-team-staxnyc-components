export default function PredictionCard({ prediction }) {
  return (
    <section className="card panel prediction-card">
      <h3>Next Game Prediction</h3>
      <p className="prediction-sub">Projected points for next game</p>
      <p className="prediction-sub" style={{ marginTop: '0.5rem' }}>
        {prediction != null ? prediction + ' pts' : 'Coming soon'}
      </p>
    </section>
  )
}
