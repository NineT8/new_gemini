import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Terminal, CheckCircle2, AlertCircle, Loader2, Sparkles, Clock, Zap, FileText, Download, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Timeline from './Timeline';

export default function MissionControl({ jobId, onReset }) {
    const [status, setStatus] = useState('connecting');
    const [logs, setLogs] = useState([]);
    const [report, setReport] = useState(null);
    const logEndRef = useRef(null);

    // Download report as markdown file
    const downloadReport = () => {
        if (!report) return;
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus-research-${jobId.slice(0, 8)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Download report as PDF (using browser print)
    const downloadPDF = () => {
        window.print();
    };

    useEffect(() => {
        const eventSource = new EventSource(`${import.meta.env.VITE_API_URL || ''}/api/v1/jobs/${jobId}/events`);

        eventSource.onmessage = (event) => {
            // Keep alive ping or generic message
        };

        eventSource.addEventListener('log', (e) => {
            const log = JSON.parse(e.data);
            setLogs((prev) => [...prev, log]);
        });

        eventSource.addEventListener('status', (e) => {
            const data = JSON.parse(e.data);
            setStatus(data.status);
        });

        eventSource.addEventListener('result', (e) => {
            const data = JSON.parse(e.data);
            setReport(data.report);
            setStatus('completed');
            eventSource.close();
        });

        eventSource.onerror = (err) => {
            console.error("EventSource failed:", err);
            setStatus('connection_error');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [jobId]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const getStatusBadge = () => {
        const configs = {
            connecting: { class: 'badge-active', label: 'Connecting', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
            planning: { class: 'badge-active', label: 'Planning', icon: <Sparkles className="w-3 h-3" /> },
            executing: { class: 'badge-active', label: 'Executing', icon: <Zap className="w-3 h-3" /> },
            verifying: { class: 'badge-warning', label: 'Verifying', icon: <Clock className="w-3 h-3" /> },
            completed: { class: 'badge-success', label: 'Complete', icon: <CheckCircle2 className="w-3 h-3" /> },
            failed: { class: 'badge-error', label: 'Failed', icon: <AlertCircle className="w-3 h-3" /> },
            connection_error: { class: 'badge-error', label: 'Connection Error', icon: <AlertCircle className="w-3 h-3" /> },
        };
        const config = configs[status] || configs.connecting;
        return (
            <span className={config.class}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    // Completed Report View
    if (status === 'completed' && report) {
        return (
            <div className="min-h-screen">
                {/* Header - Hide when printing */}
                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl print-hide dark:bg-slate-900/80 dark:border-slate-700">
                    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>New Research</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={downloadReport}
                                className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download MD
                            </button>
                            <button
                                onClick={downloadPDF}
                                className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Print / PDF</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Report Content */}
                <main className="max-w-4xl mx-auto px-6 py-12">
                    <div className="mb-8 flex items-center justify-between print-hide">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30
                                            border border-emerald-200 dark:border-emerald-700 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Research Report</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Generated by Nexus AI</p>
                            </div>
                        </div>
                        <span className="badge-success">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                        </span>
                    </div>

                    <div className="glass-card p-8 md:p-12 print:shadow-none print:border-0 print:p-0">
                        <div className="report-container">
                            <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Action Cards - Hide when printing */}
                    <div className="grid md:grid-cols-2 gap-4 mt-8 print-hide">
                        <button
                            onClick={onReset}
                            className="glass-card-hover p-6 text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center 
                                                group-hover:bg-indigo-100 transition-colors">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">New Research</h3>
                                    <p className="text-sm text-slate-500">Start another research session</p>
                                </div>
                            </div>
                        </button>
                        <button className="glass-card-hover p-6 text-left group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center 
                                                group-hover:bg-purple-100 transition-colors">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">View History</h3>
                                    <p className="text-sm text-slate-500">Browse previous research</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Active Research View
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header - Minimal & Aesthetic */}
            <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 animate-ping opacity-20"></div>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Session</p>
                        <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{jobId.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge()}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Timeline */}
                <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 overflow-y-auto hidden lg:block">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Execution Plan</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-full">{logs.filter(l => l.message.startsWith('Executing:')).length} steps</span>
                    </div>
                    <Timeline logs={logs} status={status} />
                </aside>

                {/* Main: Logs & Output */}
                <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
                    <div className="flex-1 p-6 overflow-y-auto space-y-1">
                        {logs.length === 0 && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center space-y-4">
                                    <div className="relative">
                                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                                        <div className="absolute inset-0 w-10 h-10 mx-auto rounded-full bg-indigo-500/20 animate-ping"></div>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400">Initializing research agent...</p>
                                </div>
                            </div>
                        )}
                        {logs.map((log, i) => {
                            const isGroq = log.message.includes('[Groq]');
                            const isGemini = log.message.includes('[Gemini]');
                            const isSeparator = log.message.includes('━━━');

                            return (
                                <div
                                    key={i}
                                    className={`flex gap-3 py-2 px-3 rounded-lg transition-colors ${isSeparator ? 'text-slate-300 dark:text-slate-600 py-1' :
                                        log.level === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                                            log.level === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                                                isGemini ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-l-2 border-purple-400' :
                                                    isGroq ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-l-2 border-cyan-400' :
                                                        log.message.startsWith('Executing:') ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' :
                                                            'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <span className="text-slate-400 dark:text-slate-500 shrink-0 font-mono text-sm">
                                        [{new Date(log.timestamp).toLocaleTimeString()}]
                                    </span>
                                    <span className="font-mono text-sm flex items-center gap-2">
                                        {isGroq && <span className="px-1.5 py-0.5 text-xs font-bold bg-cyan-500 text-white rounded">GROQ</span>}
                                        {isGemini && <span className="px-1.5 py-0.5 text-xs font-bold bg-purple-500 text-white rounded">GEMINI</span>}
                                        {log.message.replace('[Groq] ', '').replace('[Gemini] ', '')}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={logEndRef} />
                    </div>

                    {/* Status Bar */}
                    <div className="h-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Terminal className="w-4 h-4" />
                            <span className="animate-pulse">Agent processing...</span>
                        </div>
                        <button
                            onClick={onReset}
                            className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
