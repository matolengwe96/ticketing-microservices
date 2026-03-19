import { useState } from 'react';
import { useRouter } from 'next/router';
import useRequest from '../../hooks/use-request';

export default function NewTicket({ currentUser }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price: parseFloat(price) },
    onSuccess: () => router.push('/'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
  };

  if (!currentUser) {
    return (
      <div className="alert alert-warning">
        You must be signed in to sell a ticket.
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h3 className="card-title mb-4">List a New Ticket</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Concert – Main Stage"
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Price (USD)</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    className="form-control"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="0.00"
                    onBlur={() =>
                      setPrice((v) =>
                        v ? parseFloat(v).toFixed(2) : ''
                      )
                    }
                  />
                </div>
              </div>
              {errors}
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success">
                  List Ticket
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => router.push('/')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
