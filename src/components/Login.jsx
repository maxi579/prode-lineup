import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(async () => {
      let result;
      if (isLogin) {
        result = login(email, password);
      } else {
        if (!name.trim()) {
          setError('Ingresá tu nombre');
          setLoading(false);
          return;
        }
        result = await register(name, email, password);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 600);
  };


  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="bg-grid"></div>
        <div className="bg-glow"></div>
        <div className="bg-glow-2"></div>
      </div>

      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Zap size={28} />
          </div>
          <h1 className="login-title">PRODE LINEUP</h1>
          <p className="login-desc">Mundial 2026 · LineUp Coworking</p>
        </div>

        {/* Card */}
        <div className="login-card">
          {/* Tabs */}
          <div className="login-tabs">
            <button
              className={`tab ${isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Iniciar Sesión
            </button>
            <button
              className={`tab ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  <User size={14} />
                  Nombre
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <Mail size={14} />
                Email
              </label>
              <input
                type="email"
                className="input"
                placeholder="tu@correo.com (cualquier mail)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={14} />
                Contraseña
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">{error}</div>
            )}

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading"></span>
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Crear Cuenta'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="demo-section">
            <p className="demo-title">Cuenta de prueba:</p>
            <div className="demo-creds">
              <code>maxi@lineup.com / 1234</code>
            </div>
            <p className="demo-title" style={{ marginTop: '6px', fontSize: '0.65rem', opacity: 0.6 }}>
              O registrate con cualquier email
            </p>
          </div>
        </div>

        <p className="login-footer">
          ⚽ Pronósticos · 🏆 Ranking · 💬 Chat · 🎁 Premios
        </p>
      </div>
    </div>
  );
}
