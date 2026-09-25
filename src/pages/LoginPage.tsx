import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Gavel, Briefcase, Shield, Mail, Lock, Building2, HelpCircle, ArrowRight, Sun, Moon, AlertCircle, CheckCircle2, FileBadge } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api';
import { CaptchaChallenge } from '@/components/common/CaptchaChallenge';
import { PasswordStrengthMeter } from '@/components/common/PasswordStrengthMeter';
import { isPasswordStrong } from '@/lib/validation';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRoleParam = (searchParams.get('role') || 'judge') as 'judge' | 'lawyer' | 'staff' | 'citizen' | 'admin';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'judge' | 'lawyer' | 'staff' | 'citizen' | 'admin'>(initialRoleParam);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'judge' | 'lawyer' | 'staff' | 'citizen'>('judge');
  const [regDesignation, setRegDesignation] = useState('');
  const [regCourt, setRegCourt] = useState('');
  const [regOfficialId, setRegOfficialId] = useState('');
  const [regCaptchaVerified, setRegCaptchaVerified] = useState(false);
  const [regStatusMsg, setRegStatusMsg] = useState<{ type: 'success' | 'pending' | 'error'; msg: string } | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Populate seed credentials into form when role card is picked
  const handleRoleQuickSelect = (role: 'judge' | 'lawyer' | 'staff' | 'citizen' | 'admin') => {
    setLoginRole(role);
    if (role !== 'admin') {
      setRegRole(role);
    }
    if (role === 'judge') {
      setLoginEmail('judge@lexora.gov.in');
      setLoginPassword('lexora123');
    } else if (role === 'lawyer') {
      setLoginEmail('lawyer@lexora.gov.in');
      setLoginPassword('lexora123');
    } else if (role === 'staff') {
      setLoginEmail('staff@lexora.gov.in');
      setLoginPassword('lexora123');
    } else if (role === 'citizen') {
      setLoginEmail('citizen@lexora.gov.in');
      setLoginPassword('lexora123');
    } else {
      setLoginEmail('admin@lexora.gov.in');
      setLoginPassword('lexora123');
    }
  };

  useEffect(() => {
    handleRoleQuickSelect(initialRoleParam);
  }, [initialRoleParam]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!captchaVerified) {
      setLoginError('Please complete the security CAPTCHA verification math challenge.');
      return;
    }

    setLoading(true);
    try {
      await login(loginRole === 'staff' ? 'court_staff' : loginRole, loginEmail, loginPassword);
      navigate(`/${loginRole}/dashboard`);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Account pending verification by National Judicial Administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatusMsg(null);

    if (!regCaptchaVerified) {
      setRegStatusMsg({ type: 'error', msg: 'Please complete the security CAPTCHA math challenge.' });
      return;
    }

    if (!regEmail.includes('@')) {
      setRegStatusMsg({ type: 'error', msg: 'Please enter a valid official email address.' });
      return;
    }

    if (!isPasswordStrong(regPassword)) {
      setRegStatusMsg({
        type: 'error',
        msg: 'Password does not meet required strength criteria (8+ characters, uppercase letter, number, and special symbol).'
      });
      return;
    }

    setLoading(true);
    try {
      const data = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        designation: regRole === 'citizen' ? 'Litigant Citizen' : (regDesignation || `${regRole.toUpperCase()} Officer`),
        court: regRole === 'citizen' ? 'Public Judicial Portal' : (regCourt || 'High Court of Judicature'),
        officialId: regRole === 'citizen' ? 'CITIZEN-SELF' : (regOfficialId || 'N/A')
      });

      if (data.pending) {
        setRegStatusMsg({
          type: 'pending',
          msg: `Registration submitted! Account credentials (ID: ${regOfficialId || 'N/A'}) are pending verification by the National Judicial Administrator. Access is blocked until approval.`
        });
      } else {
        setRegStatusMsg({
          type: 'success',
          msg: regRole === 'citizen'
            ? 'Litigant Citizen account registered and verified! You may now sign in directly.'
            : 'Account created and verified! You may now sign in.'
        });
      }
    } catch (err: any) {
      setRegStatusMsg({ type: 'error', msg: err.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center theme-page-bg p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-xl my-8"
      >
        <div className="theme-card border-t-4 border-t-[var(--primary-accent)] p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
          {/* Institutional Header */}
          <div className="text-center space-y-1.5 border-b border-subtle pb-4">
            <div className="flex justify-center items-center gap-2.5">
              <div className="p-2 theme-primary-btn rounded-sm">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-serif font-bold tracking-tight theme-heading">LEXORA</h1>
            </div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider theme-subtext">
              Judicial Intelligence Platform
            </p>
            <p className="text-[11px] theme-subtext font-sans">
              Authorized Judicial Access Portal · Government of India Judicial Network
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex theme-elevated p-1 rounded-sm border border-subtle">
            <button
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
              className={`flex-1 py-2 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'login' ? 'theme-primary-btn font-bold' : 'theme-heading opacity-70 hover:opacity-100'
              }`}
            >
              Official Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setRegStatusMsg(null); }}
              className={`flex-1 py-2 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'register' ? 'theme-primary-btn font-bold' : 'theme-heading opacity-70 hover:opacity-100'
              }`}
            >
              Register Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Quick Select Role Cards */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-semibold text-[var(--primary-accent)] uppercase tracking-wider text-center">
                  Select Role Credentials:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'judge', label: 'Hon\'ble Judge', icon: Gavel },
                    { id: 'lawyer', label: 'Advocate', icon: Briefcase },
                    { id: 'staff', label: 'Court Staff', icon: Building2 },
                    { id: 'citizen', label: 'Litigant Citizen', icon: HelpCircle },
                    { id: 'admin', label: 'Admin', icon: Shield },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleQuickSelect(r.id as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-sm border transition-all cursor-pointer ${
                        loginRole === r.id
                          ? 'border-[var(--primary-accent)] bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] font-bold'
                          : 'border-subtle theme-card theme-subtext hover:theme-heading'
                      }`}
                    >
                      <r.icon className="w-4 h-4 mb-1 text-[var(--primary-accent)]" />
                      <span className="text-[11px] font-serif">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Official Email Address:</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-subtext" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. judge@lexora.gov.in"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-sm text-xs theme-heading outline-none focus:border-[var(--primary-accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Password:</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-subtext" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-sm text-xs theme-heading outline-none focus:border-[var(--primary-accent)]"
                    />
                  </div>
                </div>

                {/* Security CAPTCHA Challenge */}
                <CaptchaChallenge onVerify={setCaptchaVerified} />

                {loginError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs rounded-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full theme-primary-btn text-xs font-semibold py-2.5 rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{loading ? 'Authenticating Official Credentials...' : 'Sign In to Presiding Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* REGISTRATION FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regRole === 'citizen' ? (
                <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-sm text-xs text-sky-900 dark:text-sky-200">
                  <strong>Citizen Account Registration:</strong> Litigant citizen accounts receive immediate access to public case tracking, cause lists, order downloads, and e-filing services.
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm text-xs text-amber-900 dark:text-amber-200">
                  <strong>Official Registration Rule:</strong> Judicial Officers, Advocates, and Court Staff registrations require manual verification by the National Judicial Administrator before portal entry is authorized.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Full Legal Name:</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={regRole === 'citizen' ? "e.g. Ananth Rajendran" : "e.g. Adv. Rajesh Deshmukh"}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-sm text-xs theme-heading outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">
                    {regRole === 'citizen' ? "Email Address:" : "Official Email Address:"}
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={regRole === 'citizen' ? "e.g. citizen@gmail.com" : "e.g. rajesh@judiciary.gov.in"}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-sm text-xs theme-heading outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>
              </div>

              <div className={`grid grid-cols-1 ${regRole === 'citizen' ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-3`}>
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Account Category / Role:</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-sm text-xs theme-heading outline-none focus:border-[var(--primary-accent)]"
                  >
                    <option value="citizen">Litigant Citizen</option>
                    <option value="lawyer">Advocate / Lawyer</option>
                    <option value="judge">Hon'ble Judge</option>
                    <option value="staff">Court Bench Registrar / Staff</option>
                  </select>
                </div>

                {regRole !== 'citizen' && (
                  <div>
                    <label className="block text-xs font-semibold theme-subtext mb-1">Bar / Judicial ID Number:</label>
                    <input
                      type="text"
                      required
                      value={regOfficialId}
                      onChange={(e) => setRegOfficialId(e.target.value)}
                      placeholder="e.g. BAR/2024/9912 or JUD/1042"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-sm text-xs theme-heading outline-none focus:border-[var(--primary-accent)]"
                    />
                  </div>
                )}
              </div>

              {regRole !== 'citizen' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold theme-subtext mb-1">Designation Title:</label>
                    <input
                      type="text"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      placeholder="e.g. Senior Bench Advocate"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-sm text-xs theme-heading outline-none focus:border-[var(--primary-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-subtext mb-1">Court / Bar Association:</label>
                    <input
                      type="text"
                      value={regCourt}
                      onChange={(e) => setRegCourt(e.target.value)}
                      placeholder="e.g. High Court of Judicature"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-sm text-xs theme-heading outline-none focus:border-[var(--primary-accent)]"
                    />
                  </div>
                </div>
              )}

              {/* Password with Real-Time Strength Meter */}
              <div>
                <label className="block text-xs font-semibold theme-subtext mb-1">Secure Password:</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 8 characters, uppercase, number & symbol"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-sm text-xs theme-heading outline-none focus:border-[var(--primary-accent)]"
                />
                <PasswordStrengthMeter password={regPassword} />
              </div>

              {/* CAPTCHA Challenge */}
              <CaptchaChallenge onVerify={setRegCaptchaVerified} />

              {regStatusMsg && (
                <div className={`p-3.5 rounded-sm text-xs border flex items-start gap-2 ${
                  regStatusMsg.type === 'pending'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                    : regStatusMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                }`}>
                  {regStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  )}
                  <span>{regStatusMsg.msg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full theme-primary-btn text-xs font-semibold py-2.5 rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileBadge className="w-4 h-4" />
                <span>{loading ? 'Submitting Registration...' : regRole === 'citizen' ? 'Submit Citizen Registration' : 'Submit Official Account Registration'}</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
