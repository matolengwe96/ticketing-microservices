import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useRequest from '../../hooks/use-request';

export default function SignIn({ onAuthChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: { email, password },
    onSuccess: () => {
      onAuthChange();
      router.push('/');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h3 className="card-title mb-4">Sign in to TicketHub</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email address</label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {errors}
              <button type="submit" className="btn btn-primary w-100">
                Sign In
              </button>
            </form>
            <hr />
            <p className="text-center mb-0 text-muted small">
              No account yet?{' '}
              <Link href="/auth/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
