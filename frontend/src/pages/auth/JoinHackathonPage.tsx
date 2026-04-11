import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export const JoinHackathonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [preview, setPreview] = useState<{hackathon_name: string; role: string; team_name: string | null} | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, isAuthenticated, login, hydrateUserFromToken, logout } = useAuth();
  const navigate = useNavigate();

  // Registration Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No invite token provided in URL.');
      setIsLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        const data = await api.getInvitePreview(token);
        setPreview(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Invalid or expired invite link.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreview();
  }, [token]);

  const handleRegisterAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // 1. Register
      const res = await api.register(email, password, fullName);
      hydrateUserFromToken(res.access_token);
      
      // 2. Redeem Token
      await processRedeem();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    }
  };

  const handleLoginJoin = async () => {
    await processRedeem();
  };

  const processRedeem = async () => {
    try {
      const res = await api.redeemInvite(token!, preview?.team_name || undefined);
      // Route based on newly assigned role
      if (res.role === 'organizer') navigate('/organizer/dashboard');
      else if (res.role === 'judge') navigate('/judge/dashboard');
      else navigate('/team/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to join hackathon.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700 text-center">
        
        {error ? (
          <div>
            <div className="text-coral-500 mb-4 text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Invalid Invite</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Link to="/login" className="text-teal-400 hover:underline">Go to Login</Link>
          </div>
        ) : preview ? (
          <div>
             <h2 className="text-2xl font-bold text-teal-400 mb-4">You're Invited!</h2>
             <p className="text-slate-300 mb-6">
                You have been invited to join <span className="font-bold text-amber-400">{preview.hackathon_name}</span> as a <span className="font-bold uppercase text-teal-400">{preview.role}</span>.
                {preview.team_name && <span><br/>You will be joined to the team: <strong>{preview.team_name}</strong></span>}
             </p>

             {isAuthenticated && user ? (
                 <div className="space-y-4">
                     <p className="text-sm text-slate-400">Signed in as {user.email}</p>
                     <button onClick={handleLoginJoin} className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-3 px-4 rounded-lg">
                        Accept Invite & Join
                     </button>
                     <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-300 underline">
                        Sign out / Use different account
                     </button>
                 </div>
             ) : (
                <div className="border-t border-slate-700 pt-6 mt-6">
                    <p className="text-sm text-slate-400 mb-4">Create an account to accept this invite</p>
                    <form onSubmit={handleRegisterAndJoin} className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors mt-4"
                        >
                            Register & Join
                        </button>
                    </form>
                    <p className="mt-4 text-center text-slate-400 text-sm">
                        Already have an account? <Link to={`/login`} state={{ from: location.pathname + location.search }} className="text-teal-400 hover:underline">Log in first</Link>
                    </p>
                </div>
             )}
          </div>
        ) : null}

      </div>
    </div>
  );
};
