function EmptyState({ viewName, message }) {
  return (
    <div className={`view ${viewName ?? ''}`.trim()}>
      <section className="empty-state">{message}</section>
    </div>
  );
}

export default EmptyState;
