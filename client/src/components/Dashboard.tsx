import { useState } from 'react';
import axios from 'axios';
import { CertGraph, type CertData } from './CertGraph';
import {
    Search,
    ShieldCheck,
    ShieldAlert,
    Globe,
    Calendar,
    Server,
    Loader2,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export const Dashboard = () => {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CertData | null>(null);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!domain) return;
        setLoading(true);
        setError('');
        setData(null);

        // Remove protocol if user pastes it
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await axios.get(`${apiUrl}/api/analyze?domain=${cleanDomain}`);
            setData(response.data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'Failed to analyze domain');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="mb-12 flex flex-col items-center justify-center gap-6 border-b border-white/5 pb-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                                Cert<span className="text-indigo-400">Watcher</span>
                            </h1>
                            <div className="p-3 bg-indigo-500/10">
                                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium">SSL/TLS Chain Visualizer & Analyzer</p>
                        </div>
                    </div>
                </header>

                {/* Search Section */}
                <div className="max-w-3xl mx-auto mb-12">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <div className="relative flex items-center bg-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="pl-4 flex items-center justify-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter domain (e.g., google.com)"
                                className="w-full bg-transparent border-none py-5 pl-3 pr-4 text-white placeholder-slate-500 focus:ring-0 text-lg"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !domain}
                                className="px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-l border-white/5"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Analyzing</span>
                                    </>
                                ) : (
                                    <span>Analyze</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                </div>

                {/* Results Dashboard */}
                {data && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* Left Column: Visual Graph (Takes 8 columns) */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-1 overflow-hidden h-[600px] shadow-xl relative group">
                                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-mono text-slate-400 border border-white/5">
                                    Graph View
                                </div>
                                {/* Wrap Graph in a clean container */}
                                <div className="w-full h-full bg-slate-950/50 rounded-xl overflow-hidden">
                                    <CertGraph data={data} />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details (Takes 4 columns) */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Status Card */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl">
                                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-indigo-400" />
                                    Certificate Health
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col items-center justify-center text-center">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Status</span>
                                        <div className={`flex items-center gap-2 font-bold ${data.daysRemaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {data.daysRemaining > 0 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            {data.daysRemaining > 0 ? 'Valid' : 'Expired'}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col items-center justify-center text-center">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Expires In</span>
                                        <span className={`text-xl font-mono font-bold ${data.daysRemaining < 30 ? 'text-amber-400' : 'text-white'}`}>
                                            {data.daysRemaining}d
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl flex-1 overflow-hidden">
                                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Server className="w-5 h-5 text-indigo-400" />
                                    Leaf Details
                                </h2>

                                <div className="space-y-4 font-mono text-sm">
                                    <DetailRow
                                        label="Common Name (CN)"
                                        value={data.subject}
                                        icon={<Globe className="w-3 h-3" />}
                                    />
                                    <DetailRow
                                        label="Issuer"
                                        value={data.issuer}
                                        icon={<ShieldCheck className="w-3 h-3" />}
                                    />
                                    <DetailRow
                                        label="Valid Until"
                                        value={new Date(data.validTo).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                        icon={<Calendar className="w-3 h-3" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper component for cleaner rows
const DetailRow = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
    <div className="group p-4 rounded-xl bg-slate-950/30 border border-white/5 hover:border-indigo-500/30 transition-colors">
        <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-2">
            {icon}
            {label}
        </div>
        <div className="text-slate-200 break-all leading-relaxed">
            {value}
        </div>
    </div>
);