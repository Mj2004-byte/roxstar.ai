import React from 'react';
import { LatencyMetrics } from '../types';
import { Activity, Signal } from 'lucide-react';

interface MetricsOverlayProps {
  metrics: LatencyMetrics;
  connectionState: string;
}

export const MetricsOverlay: React.FC<MetricsOverlayProps> = ({ metrics, connectionState }) => {
  return (
    <div className="bg-[#160d2b]/90 backdrop-blur border border-pink-500/20 rounded-lg px-3 py-2 text-xs text-pink-200 flex items-center justify-between gap-4 font-mono shadow-md">
      <div className="flex items-center gap-2">
        <Signal className={`w-3.5 h-3.5 ${connectionState === 'connected' ? 'text-pink-400' : 'text-amber-400 animate-pulse'}`} />
        <span>Status: <strong className="text-white uppercase">{connectionState}</strong></span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-pink-300">
          <Activity className="w-3.5 h-3.5 text-pink-400" /> Telemetry:
        </span>
        <span>STT: <strong className="text-white">{metrics.stt_ms}ms</strong></span>
        <span>LLM: <strong className="text-white">{metrics.llm_ms}ms</strong></span>
        <span>TTS: <strong className="text-white">{metrics.tts_ms}ms</strong></span>
        <span>Total: <strong className="text-pink-400 font-bold">{(metrics.total_ms / 1000).toFixed(2)}s</strong></span>
      </div>
    </div>
  );
};
