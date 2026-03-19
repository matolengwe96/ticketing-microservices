import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useRequest from '../../hooks/use-request';

export default function TicketDetail({ currentUser }) {
  const router = useRouter();
  const { ticketId } = router.query;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: { ticketId },
    onSuccess: (order) => router.push(`/orders/${order.id}`),
  });

  useEffect(() => {
    if (!ticketId) return;
    fetch(`/api/tickets/${ticketId}`, { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => setTicket(data))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!ticket || ticket.errors) {
    return <div className="alert alert-danger">Ticket not found.</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h3 className="card-title">{ticket.title}</h3>
            <p className="display-6 text-success fw-bold">${ticket.price}</p>

            {ticket.orderId && (
              <div className="alert alert-warning">
                This ticket is currently reserved.
              </div>
            )}

            {errors}

            {currentUser && !ticket.orderId ? (
              <button
                className="btn btn-primary btn-lg w-100 mt-2"
                onClick={() => doRequest()}
              >
                Purchase — ${ticket.price}
              </button>
            ) : !currentUser ? (
              <div className="alert alert-info mt-2">
                <Link href="/auth/signin">Sign in</Link> to purchase this ticket.
              </div>
            ) : null}

            <div className="mt-3">
              <Link href="/" className="text-muted small">
                ← Back to all tickets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
