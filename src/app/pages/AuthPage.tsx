import { useState } from 'react';
import { Wrench, Eye, EyeOff, ArrowLeft, CheckCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function AuthPage() {
  const { authMode, closeAuth, login, register, openAuth, navigate } = useApp();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (authMode === 'login') {
      const errMsg = await login(form.email.trim(), form.password);
      if (errMsg) setError(errMsg);
      // On success, login() navigates to home automatically

    } else if (authMode === 'register') {
      if (form.password !== form.confirm) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const errMsg = await register(form.name.trim(), form.email.trim(), form.password);
      if (errMsg) {
        setError(errMsg);
      } else {
        // If email confirmation is required, show check-inbox state.
        // If auto-signed-in, register() navigates to home automatically.
        setAwaitingConfirmation(true);
      }

    } else {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetErr) setError(resetErr.message);
      else setForgotSent(true);
    }

    setLoading(false);
  };

  const titles: Record<typeof authMode, string> = {
    login: 'Welcome back',
    register: 'Join ToolLink',
    forgot: 'Reset your password',
  };

  const subtitles: Record<typeof authMode, string> = {
    login: 'Sign in to your tradie account',
    register: 'Create your free account and start trading',
    forgot: "We'll send a reset link to your email",
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-start justify-center pt-8 pb-16 px-4">
      <div className="w-full max-w-[420px]">

        {/* Back to home */}
        <button
          type="button"
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to ToolLink
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#EBEBEB]">

          {/* Dark header */}
          <div className="bg-[#111111] px-8 pt-8 pb-7">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 mb-5 group"
            >
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Wrench style={{ width: 18, height: 18 }} className="text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Tool<span className="text-primary">Link</span>
              </span>
            </button>
            <h1 className="text-2xl font-extrabold text-white leading-tight">{titles[authMode]}</h1>
            <p className="text-sm text-gray-400 mt-1">{subtitles[authMode]}</p>
          </div>

          {/* Form area */}
          <div className="px-8 py-7">

            {/* ── Awaiting email confirmation ── */}
            {awaitingConfirmation ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="font-bold text-foreground text-lg mb-2">Check your inbox</h2>
                <p className="text-sm text-muted-foreground mb-1">We sent a confirmation link to</p>
                <p className="text-sm font-semibold text-foreground mb-4">{form.email}</p>
                <p className="text-xs text-muted-foreground mb-6">
                  Click the link in the email to activate your account, then sign in.
                  Check your spam folder if you don&apos;t see it.
                </p>
                <button
                  type="button"
                  onClick={() => { setAwaitingConfirmation(false); openAuth('login'); }}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-orange-600 transition-colors text-sm"
                >
                  Go to Sign In
                </button>
              </div>

            ) : forgotSent ? (
              /* ── Forgot password sent ── */
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-bold text-foreground text-lg mb-1">Reset link sent</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Check your inbox at <strong>{form.email}</strong> for the password reset link.
                </p>
                <button
                  type="button"
                  onClick={() => { setForgotSent(false); openAuth('login'); }}
                  className="flex items-center gap-2 text-sm text-primary font-semibold mx-auto hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </button>
              </div>

            ) : (
              /* ── Main form ── */
              <>
                {/* Social login buttons */}
                {authMode !== 'forgot' && (
                  <div className="mb-5">
                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center justify-center gap-3 py-3 border border-[#EBEBEB] rounded-xl text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
                      title="Google sign-in coming soon"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                    <div className="flex items-center gap-3 mt-4 mb-5">
                      <div className="flex-1 h-px bg-[#EBEBEB]" />
                      <span className="text-xs text-muted-foreground font-medium">or use your email</span>
                      <div className="flex-1 h-px bg-[#EBEBEB]" />
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        autoFocus
                        value={form.name}
                        onChange={set('name')}
                        placeholder="Jake Morrison"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      autoComplete={authMode === 'login' ? 'username' : 'email'}
                      autoFocus={authMode !== 'register'}
                      value={form.email}
                      onChange={set('email')}
                      placeholder="jake@example.com.au"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors text-sm"
                    />
                  </div>

                  {authMode !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-semibold text-foreground">Password</label>
                        {authMode === 'login' && (
                          <button
                            type="button"
                            onClick={() => openAuth('forgot')}
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                          value={form.password}
                          onChange={set('password')}
                          placeholder="••••••••"
                          minLength={6}
                          className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPass ? 'Hide password' : 'Show password'}
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={form.confirm}
                        onChange={set('confirm')}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors text-sm"
                      />
                    </div>
                  )}

                  {/* Error — Supabase's real message */}
                  {error && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 leading-relaxed">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-1"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading
                      ? 'Please wait…'
                      : authMode === 'login'
                      ? 'Sign In'
                      : authMode === 'register'
                      ? 'Create Account'
                      : 'Send Reset Link'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {authMode === 'register' && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      By creating an account you agree to our{' '}
                      <a href="#" className="text-primary hover:underline">Terms of Use</a>
                      {' '}and{' '}
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                    </p>
                  )}
                </form>

                {/* Mode switcher */}
                <div className="mt-6 pt-5 border-t border-[#EBEBEB] text-center text-sm text-muted-foreground">
                  {authMode === 'login' ? (
                    <>
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setError(''); openAuth('register'); }}
                        className="text-primary font-semibold hover:underline"
                      >
                        Sign up free
                      </button>
                    </>
                  ) : authMode === 'register' ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setError(''); openAuth('login'); }}
                        className="text-primary font-semibold hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setError(''); openAuth('login'); }}
                      className="flex items-center gap-1.5 text-primary font-semibold hover:underline mx-auto"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom links */}
        <div className="mt-6 text-center text-xs text-muted-foreground space-x-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Use</a>
          <a href="#" className="hover:text-primary transition-colors">Help</a>
        </div>
      </div>
    </div>
  );
}
