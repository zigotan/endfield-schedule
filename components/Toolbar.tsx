// src/components/Toolbar.tsx
import React from 'react';
import { 
  Download, ZoomIn, MoveHorizontal, ChevronLeft, ChevronRight, 
  Clock, Lock 
} from 'lucide-react';
import { format } from 'date-fns';
import { EventType } from '../types';

interface ToolbarProps {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  filterType: EventType | 'all';
  setFilterType: (type: EventType | 'all') => void;
  lastUpdated: string;
  canvasWidth: number;
  setCanvasWidth: (width: number) => void;
  handleExport: () => void;
  enableAdminFeatures: boolean;
  isAdmin: boolean;
  setShowLoginModal: (show: boolean) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPeriodStart,
  currentPeriodEnd,
  handlePrevMonth,
  handleNextMonth,
  filterType,
  setFilterType,
  lastUpdated,
  canvasWidth,
  setCanvasWidth,
  handleExport,
  enableAdminFeatures,
  isAdmin,
  setShowLoginModal,
}) => {
  return (
    <header className="flex-none h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#18181b]/80 backdrop-blur-md z-50 relative">
      <div className="flex items-center gap-2">
        {enableAdminFeatures && !isAdmin && (
          <button onClick={() => setShowLoginModal(true)} className="mr-4 flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white border border-zinc-800 bg-black/50 px-2 py-1 rounded">
            <Lock size={12} /> ADMIN LOGIN
          </button>
        )}
        <div className="flex items-center bg-black/40 rounded border border-white/5 p-1 mr-2">
          <button onClick={handlePrevMonth} className="p-1 hover:text-amber-400 text-zinc-400"><ChevronLeft size={16} /></button>
          <span className="px-3 text-xs font-mono text-white font-bold min-w-[140px] text-center">{format(currentPeriodStart, 'yyyy/MM')} - {format(currentPeriodEnd, 'yyyy/MM')}</span>
          <button onClick={handleNextMonth} className="p-1 hover:text-amber-400 text-zinc-400"><ChevronRight size={16} /></button>
        </div>
        <div className="flex items-center bg-black/40 rounded border border-white/5 p-1 gap-1">
           {['all', 'main', 'story', 'event', 'high_difficulty', 'gacha', 'campaign'].map(t => (
             <button key={t} onClick={() => setFilterType(t as any)} className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase ${filterType === t ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{t === 'high_difficulty' ? 'HIGH' : t}</button>
           ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <div className="flex items-center gap-2 px-3 py-1.5 border border-red-900/50 bg-red-900/10 rounded-sm">
            <Clock size={14} className="text-red-500" />
            <span className="text-xs font-mono font-bold text-red-500">UPDATE: {lastUpdated}</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/5">
          <MoveHorizontal size={14} className="text-zinc-500" /><input type="range" min="800" max="5000" value={canvasWidth} onChange={(e) => setCanvasWidth(Number(e.target.value))} className="w-32 accent-amber-400 cursor-pointer h-1" /><ZoomIn size={14} className="text-zinc-500" />
        </div>
        {enableAdminFeatures && (
           <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-amber-400 text-amber-400 font-bold text-xs uppercase hover:bg-amber-400 hover:text-black transition-colors rounded-sm"><Download size={14} /> EXPORT</button>
        )}
      </div>
    </header>
  );
};