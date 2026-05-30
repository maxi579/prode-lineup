import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, LayoutDashboard, MessageSquare, Gift, LogOut, Menu, X, Zap, Table2 } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Partidos', icon: <LayoutDashboard size={18} /> },
    { to: '/tables', label: 'Tablas', icon: <Table2 size={18} /> },
    { to: '/leaderboard', label: 'Ranking', icon: <Trophy size={18} /> },
    { to: '/wall', label: 'Muro', icon: <MessageSquare size={18} /> },
    { to: '/prizes', label: 'Premios', icon: <Gift size={18} /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <NavLink to="/dashboard" className="navbar-brand">
          <div className="brand-icon">
            <Zap size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">PRODE</span>
            <span className="brand-sub">LINEUP</span>
          </div>
        </NavLink>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="navbar-user">
          {user && (
            <>
              <div className="user-badge">
                <span className="user-avatar">{user.avatar}</span>
                <span className="user-name">{user.name}</span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </>
          )}
          <button className="mobile-menu-btn btn btn-ghost btn-icon" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
