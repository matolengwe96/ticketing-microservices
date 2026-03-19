import { useEffect, useState } from 'react';
import Header from '../components/header';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = () => {
    fetch('/api/users/currentuser', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => setCurrentUser(data.currentUser || null))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <>
      <Header currentUser={currentUser} />
      <div className="container mt-4 pb-5">
        <Component
          {...pageProps}
          currentUser={currentUser}
          onAuthChange={fetchCurrentUser}
        />
      </div>
    </>
  );
}
