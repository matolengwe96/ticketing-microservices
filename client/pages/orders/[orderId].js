import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useRequest from '../../hooks/use-request';

const STATUS_LABELS = {
  created: { label: 'Awaiting Payment', color: 'warning' },
  awaiting_payment: { label: 'Awaiting Payment', color: 'info' },
  complete: { label: 'Complete', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'secondary' },
};

export default function OrderDetail({ currentUser }) {
  const router = useRouter();
  const { orderId } = router.query;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  // Pre-filled with the Stripe test VISA token for easy local testing
  const [token, setToken] = useState('tok_visa');
  const [paid, setPaid] = useState(false);

  const { doRequest: cancelOrder, errors: cancelErrors } = useRequest({
    url: `/api/orders/${orderId}`,
    method: 'delete',
    body: {},
    onSuccess: () => router.push('/orders'),
  });

  const { doRequest: payOrder, errors: payErrors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId, token },
    onSuccess: () => setPaid(true),
  });

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`, { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!order || order.errors) {
    return <div className="alert alert-danger">Order not found.</div>;
  }

  if (paid) {
    return (
      <div className="text-center mt-5">
        <div className="display-1">🎉</div>
        <h3 className="mt-3">Payment Successful!</h3>
        <p className="text-muted">Your order is now complete.</p>
        <Link href="/orders" className="btn btn-primary mt-2">
          View all orders
        </Link>
      </div>
    );
  }

  const { label, color } = STATUS_LABELS[order.status] || {
    label: order.status,
    color: 'secondary',
  };
  const canPay =
    order.status === 'created' || order.status === 'awaiting_payment';
  const canCancel = order.status === 'created';

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <div className="card shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h3 className="card-title mb-0">Order Details</h3>
              <span className={`badge bg-${color} fs-6`}>{label}</span>
            </div>
            <table className="table table-borderless mb-0">
              <tbody>
                <tr>
                  <th className="ps-0 text-muted" style={{ width: 140 }}>
                    Ticket
                  </th>
                  <td>{order.ticket?.title || '—'}</td>
                </tr>
                <tr>
                  <th className="ps-0 text-muted">Price</th>
                  <td className="text-success fw-bold">
                    ${order.ticket?.price ?? '—'}
                  </td>
                </tr>
                <tr>
                  <th className="ps-0 text-muted">Order ID</th>
                  <td className="text-monospace small">{order.id}</td>
                </tr>
                {order.expiresAt && (
                  <tr>
                    <th className="ps-0 text-muted">Expires</th>
                    <td>{new Date(order.expiresAt).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {canPay && (
          <div className="card shadow-sm mb-3">
            <div className="card-body p-4">
              <h5 className="card-title">Complete Payment</h5>
              <div className="alert alert-info small mb-3">
                <strong>Test mode:</strong> Use{' '}
                <code>tok_visa</code> as the token to simulate a successful
                Stripe payment.
              </div>
              <div className="mb-3">
                <label className="form-label">Stripe Payment Token</label>
                <input
                  className="form-control font-monospace"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="tok_visa"
                />
              </div>
              {payErrors}
              <button
                className="btn btn-success w-100"
                onClick={() => payOrder()}
                disabled={!token}
              >
                Pay ${order.ticket?.price}
              </button>
            </div>
          </div>
        )}

        <div className="d-flex gap-2">
          <Link href="/orders" className="btn btn-outline-secondary">
            ← My Orders
          </Link>
          {canCancel && (
            <button
              className="btn btn-outline-danger"
              onClick={() => cancelOrder()}
            >
              Cancel Order
            </button>
          )}
        </div>
        {cancelErrors}
      </div>
    </div>
  );
}
