import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home({ currentUser }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Available Tickets</h2>
        {currentUser && (
          <Link href="/tickets/new" className="btn btn-success">
            + Sell a Ticket
          </Link>
        )}
      </div>

      {!currentUser && (
        <div className="alert alert-info">
          <Link href="/auth/signin">Sign in</Link> to purchase or sell tickets.
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center text-muted mt-5">
          <p className="fs-5">No tickets listed yet.</p>
          {currentUser && (
            <Link href="/tickets/new" className="btn btn-outline-success">
              Be the first to sell one
            </Link>
          )}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {tickets.map((ticket) => (
            <div className="col" key={ticket.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{ticket.title}</h5>
                  <p className="card-text text-success fw-bold fs-5">
                    ${ticket.price}
                  </p>
                  {ticket.orderId && (
                    <span className="badge bg-warning text-dark mb-2">
                      Reserved
                    </span>
                  )}
                </div>
                <div className="card-footer bg-transparent border-0">
                  {currentUser && !ticket.orderId ? (
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="btn btn-primary btn-sm w-100"
                    >
                      View & Purchase
                    </Link>
                  ) : (
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="btn btn-outline-secondary btn-sm w-100"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
