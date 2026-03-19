import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useRequest from '../../hooks/use-request';

export default function SignUp({ onAuthChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: '/api/users/signup',
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
            <h3 className="card-title mb-4">Create your account</h3>
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
                  minLength={4}
                  maxLength={20}
                />
                <div className="form-text">4–20 characters</div>
              </div>
              {errors}
              <button type="submit" className="btn btn-primary w-100">
                Sign Up
              </button>
            </form>
            <hr />
            <p className="text-center mb-0 text-muted small">
              Already have an account?{' '}
              <Link href="/auth/signin">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
