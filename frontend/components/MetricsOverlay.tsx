import React from 'react';
import { LatencyMetrics } from '../types';
import { Activity, Signal } from 'lucide-react';

interface MetricsOverlayProps {
  metrics: LatencyMetrics;
  connectionState: string;
}

export const MetricsOverlay: React.FC<MetricsOverlayProps> = ({ metrics, connectionState }) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex items-center justify-between gap-4 font-mono">
      <div className="flex items-center gap-2">
        <Signal className={`w-3.5 h-3.5 ${connectionState === 'connected' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
        <span>Status: <strong className="text-slate-100 uppercase">{connectionState}</strong></span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-blue-400" /> Latency Telemetry:
        </span>
        <span>STT: <strong className="text-slate-200">{metrics.stt_ms}ms</strong></span>
        <span>LLM: <strong className="text-slate-200">{metrics.llm_ms}ms</strong></span>
        <span>TTS: <strong className="text-slate-200">{metrics.tts_ms}ms</strong></span>
        <span>Total: <strong className="text-emerald-400 font-bold">{(metrics.total_ms / 1000).toFixed(2)}s</strong></span>
      </div>
    </div>
  );
};
