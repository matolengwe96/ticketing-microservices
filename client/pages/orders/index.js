import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_COLORS = {
  created: 'warning',
  awaiting_payment: 'info',
  complete: 'success',
  cancelled: 'secondary',
};

export default function OrdersList({ currentUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (!currentUser) {
    return (
      <div className="alert alert-warning">
        <Link href="/auth/signin">Sign in</Link> to view your orders.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center text-muted mt-5">
        <p className="fs-5">No orders yet.</p>
        <Link href="/" className="btn btn-outline-primary">
          Browse tickets
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">My Orders</h2>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Ticket</th>
              <th>Price</th>
              <th>Status</th>
              <th>Expires</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const color = STATUS_COLORS[order.status] || 'secondary';
              return (
                <tr key={order.id}>
                  <td>{order.ticket?.title || '—'}</td>
                  <td>${order.ticket?.price ?? '—'}</td>
                  <td>
                    <span className={`badge bg-${color}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-muted small">
                    {order.expiresAt
                      ? new Date(order.expiresAt).toLocaleString()
                      : '—'}
                  </td>
                  <td>
                    <Link
                      href={`/orders/${order.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
