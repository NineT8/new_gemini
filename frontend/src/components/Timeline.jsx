import React from 'react';
import { Circle, CheckCircle2, Loader2, AlertCircle, Sparkles, Search, Globe, Shield } from 'lucide-react';

export default function Timeline({ logs, status }) {
    // Parse steps from logs
    const steps = logs
        .filter(l => l.message.startsWith('Executing:'))
        .map(l => {
            const desc = l.message.replace('Executing: ', '');
            const toolMatch = desc.match(/\(([^)]+)\)$/);
            return {
                desc: desc.replace(/\s*\([^)]+\)$/, ''),
                tool: toolMatch ? toolMatch[1] : 'analysis',
                status: 'completed'
            };
        });

    const isPlanning = status === 'planning';
    const isVerifying = status === 'verifying';
    const isExecuting = status === 'executing';
    const isFailed = status === 'failed';

    const getToolIcon = (tool) => {
        switch (tool) {
            case 'web_search':
                return <Search className="w-4 h-4" />;
            case 'scrape_url':
                return <Globe className="w-4 h-4" />;
            default:
                return <Sparkles className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-4 relative">
            {/* Vertical Line */}
            <div className="timeline-line" />

            {/* Planning Phase */}
            <div className="relative flex gap-4">
                <div className={`timeline-dot ${isPlanning ? 'timeline-dot-active' :
                        steps.length > 0 || isExecuting || isVerifying ? 'timeline-dot-complete' : 'timeline-dot-pending'
                    }`}>
                    {isPlanning ? (
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : steps.length > 0 || isExecuting || isVerifying ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Planning</p>
                    <p className="text-xs text-slate-500 truncate">Generating research strategy</p>
                </div>
            </div>

            {/* Dynamic Execution Steps */}
            {steps.map((step, i) => (
                <div key={i} className="relative flex gap-4">
                    <div className="timeline-dot timeline-dot-complete">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                {getToolIcon(step.tool)}
                            </span>
                            <p className="text-sm font-medium text-slate-200 truncate">{step.desc}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 ml-8">
                            {step.tool === 'web_search' ? 'Web Search' :
                                step.tool === 'scrape_url' ? 'URL Scrape' : 'Analysis'}
                        </p>
                    </div>
                </div>
            ))}

            {/* Active Step Indicator */}
            {isExecuting && (
                <div className="relative flex gap-4">
                    <div className="timeline-dot timeline-dot-active">
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-300">Processing...</p>
                        <p className="text-xs text-slate-500">Executing current step</p>
                    </div>
                </div>
            )}

            {/* Verification Phase */}
            {(steps.length > 0 || isVerifying) && (
                <div className="relative flex gap-4">
                    <div className={`timeline-dot ${isVerifying ? 'timeline-dot-active ring-amber-500' :
                            status === 'completed' ? 'timeline-dot-complete' : 'timeline-dot-pending'
                        }`}>
                        {isVerifying ? (
                            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        ) : status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <Shield className="w-4 h-4 text-slate-600" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">Verification</p>
                        <p className="text-xs text-slate-500">Fact-checking results</p>
                    </div>
                </div>
            )}

            {/* Failed State */}
            {isFailed && (
                <div className="relative flex gap-4">
                    <div className="timeline-dot ring-2 ring-red-500">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-400">Research Failed</p>
                        <p className="text-xs text-slate-500">Check logs for details</p>
                    </div>
                </div>
            )}
        </div>
    );
}
