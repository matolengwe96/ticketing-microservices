import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SignOut({ onAuthChange }) {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/users/signout', {
      method: 'POST',
      credentials: 'same-origin',
    }).finally(() => {
      onAuthChange();
      router.push('/');
    });
  }, []);

  return (
    <div className="text-center mt-5 text-muted">Signing you out…</div>
  );
}
