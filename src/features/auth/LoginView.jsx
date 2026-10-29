import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import {
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Terminal,
  Server
} from 'lucide-react';

export function LoginView() {
  const { login, isAuthenticated, isLoading: isAuthChecking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // If already authenticated as admin, redirect to target or dashboard
  if (!isAuthChecking && isAuthenticated) {
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please provide a valid operator email';
    }

    if (!password) {
      errors.password = 'Session password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password
      });

      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      // Safe, generic failure messages that never leak account existence
      if (err.status === 401 || err.code === 'INVALID_CREDENTIALS') {
        setErrorMessage('Authentication failed: Invalid operator email or session password.');
      } else if (err.status === 403 || err.code === 'FORBIDDEN_ROLE') {
        setErrorMessage('Access Denied: This account lacks verified administrator permissions.');
      } else if (err.status === 429) {
        setErrorMessage('Rate limit exceeded: Too many attempts. Please pause and retry shortly.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please verify credentials or connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background Ambience / Tactical glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 pointer-events-none overflow-hidden">
        <div className="w-[520px] h-[520px] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute w-[340px] h-[340px] rounded-full bg-surface-container-high/40 blur-[80px] -translate-x-24 translate-y-16"></div>
      </div>

      <div className="w-full max-w-[480px] bg-surface-container-lowest p-6 sm:p-8 shadow-2xl border border-outline-variant/30 relative">
        {/* Brand Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="font-headline text-lg tracking-wider text-on-surface uppercase font-bold">
              DRIPRACK
            </span>
            <span className="bg-surface-container px-2 py-0.5 font-mono text-xs text-primary font-semibold tracking-widest uppercase">
              SYS/OPS
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-on-surface-variant">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="uppercase tracking-wider">V2.4_PRD</span>
          </div>
        </div>

        {/* Title & Terminal Dossier */}
        <div className="mt-5 mb-6">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-xs uppercase tracking-widest mb-1.5">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>GATEWAY ID: 0x9924-NODE</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl text-on-surface tracking-tight uppercase font-bold">
            ADMIN CONTROL PLANE
          </h1>
          <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            Restricted operational terminal. Administrator role verification enforced via cryptographic session cookies.
          </p>
        </div>

        {/* Generic Failure Notice */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3 bg-error-container/20 border border-error/40 rounded-sm flex items-start gap-2.5 text-error text-xs font-mono"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-error" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            id="operator-email"
            name="email"
            type="email"
            label="Operator Credential [Email]"
            topRightLabel={<span className="text-primary font-semibold">ROLE: ROOT</span>}
            placeholder="admin@driprack.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
            }}
            error={fieldErrors.email}
            icon={Mail}
            disabled={isSubmitting}
            required
            autoComplete="email"
          />

          <Input
            id="operator-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Session Secret [Password]"
            topRightLabel={<span className="text-outline cursor-not-allowed">REKEY ACCESS</span>}
            placeholder="••••••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
            }}
            error={fieldErrors.password}
            icon={Key}
            disabled={isSubmitting}
            required
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-outline-variant hover:text-on-surface p-1 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* RBAC Policy Warning Card */}
          <div className="p-3 bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5 select-none">
            <ShieldCheck className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-tertiary uppercase tracking-wider font-semibold">
                POLICY: ENFORCE_RBAC
              </span>
              <span className="font-body text-xs text-on-surface-variant leading-relaxed">
                HTTP 403 Forbidden enforced for non-admin roles. Session tokens managed via HttpOnly refresh cookie.
              </span>
            </div>
          </div>

          {/* Submit Trigger with Loading State */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            icon={Lock}
            className="w-full mt-2 font-headline uppercase tracking-wider shadow-lg"
          >
            {isSubmitting ? 'VERIFYING CRYPTO TOKEN...' : 'Sign In to Admin Portal'}
          </Button>
        </form>

        {/* Security Telemetry Footer */}
        <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
              TLS 1.3 / HTTP/2 SECURED
            </span>
            <span className="text-outline-variant uppercase">PROD-US-EAST</span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant/80 text-[11px]">
            <span>STRICT REFRESH COOKIE ACTIVE</span>
            <span className="text-primary font-semibold">LATENCY 12ms</span>
          </div>
        </div>
      </div>

      {/* Outer Console Tagline */}
      <div className="mt-4 text-center">
        <p className="font-mono text-xs text-on-surface-variant/60 tracking-wider">
          AUTHENTICATION GATEWAY // SECURE INVENTORY ENGINE // UNIFIED DISPATCH
        </p>
      </div>
    </main>
  );
}

