export default function ProgressIndicator({ total, completed }) {
  const remaining = total - completed;

  return (
    <div className="progress-wrap">
      <div className="progress-label">
        {completed === total
          ? 'All done! Generating your coupon...'
          : `${completed} of ${total} visited — ${remaining} more to go!`}
      </div>
      <div className="progress-dots">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`dot ${i < completed ? 'filled' : ''}`} />
        ))}
      </div>
    </div>
  );
}
