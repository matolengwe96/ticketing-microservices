import Link from 'next/link';

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
    currentUser && { label: 'My Orders', href: '/orders' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter(Boolean)
    .map(({ label, href }) => (
      <li key={href} className="nav-item">
        <Link href={href} className="nav-link">
          {label}
        </Link>
      </li>
    ));

  return (
    <nav className="navbar navbar-dark bg-primary navbar-expand-lg px-3">
      <Link href="/" className="navbar-brand fw-bold">
        🎫 TicketHub
      </Link>
      {currentUser && (
        <span className="text-white-50 small me-auto ms-3">
          {currentUser.email}
        </span>
      )}
      <ul className="navbar-nav ms-auto d-flex flex-row gap-2">{links}</ul>
    </nav>
  );
};

export default Header;
