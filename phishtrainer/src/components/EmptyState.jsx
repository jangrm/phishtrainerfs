function EmptyState({ viewName, message }) {
  return (
    <div className={`view ${viewName}`}>
      <section className="empty-state">{message}</section>
    </div>
  );
}

export default EmptyState;
