import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111315] px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#17191d]/95 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="mb-8">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#2a2d33] bg-[#111315] px-4 py-2 text-sm text-[#d8ceb9]">
            <span className="text-xl font-black tracking-tight text-white">Q-coder</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b3d]"></span>
            <span>Builder Dashboard</span>
          </div>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-[#f6eedf]">Sign in to your workspace</h1>
          <p className="text-sm leading-6 text-[#a79b88]">Create, edit, and ship landing pages from one dark dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8576]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#111315] px-4 py-3 text-[#f6eedf] outline-none transition focus:border-[#ff6b3d]/60 focus:ring-2 focus:ring-[#ff6b3d]/20"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8576]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#111315] px-4 py-3 text-[#f6eedf] outline-none transition focus:border-[#ff6b3d]/60 focus:ring-2 focus:ring-[#ff6b3d]/20"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#f5e9d7] py-3 font-semibold text-[#111315] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-[#ff8a63] transition hover:text-[#ffb195]"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
