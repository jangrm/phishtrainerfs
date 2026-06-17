function EmailCard({ from, to, date, subject, body }) {
  return (
    <div className="email-card">
      <div className="email-header">
        <p><strong>From:</strong> {from}</p>
        <p><strong>To:</strong> {to}</p>
        <p><strong>Date:</strong> {date}</p>
      </div>
      <h2 className="email-subject">{subject}</h2>
      <p className="email-body">{body}</p>
    </div>
  );
}

export default EmailCard;