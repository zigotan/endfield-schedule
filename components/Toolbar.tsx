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
  const CHANNEL_URL = "https://www.youtube.com/channel/UCTv10NGVzs91keuRNy4z9Fg"; 
  const CHANNEL_ICON_URL = "/icon.png"; 

  return (
    <header className="flex-none min-h-14 border-b border-zinc-800 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-2 md:py-0 bg-[#18181b]/80 backdrop-blur-md z-50 relative gap-2 md:gap-0">
      
      {/* 上段 */}
      <div className="flex items-center justify-between w-full md:w-auto gap-2">
        <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-zinc-700 hover:border-amber-400 transition-colors shadow-lg group relative bg-black" title="じごちゃんねる【エンドフィールド支部】">
           <img src={CHANNEL_ICON_URL} alt="Channel Icon" className="w-full h-full object-cover" />
        </a>

        {enableAdminFeatures && !isAdmin && (
          <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white border border-zinc-800 bg-black/50 px-2 py-1 rounded whitespace-nowrap">
            <Lock size={12} /> <span className="hidden md:inline">LOGIN</span>
          </button>
        )}
        <div className="flex items-center bg-black/40 rounded border border-white/5 p-1 flex-1 md:flex-none justify-between md:justify-start">
          <button onClick={handlePrevMonth} className="p-1 hover:text-amber-400 text-zinc-400"><ChevronLeft size={16} /></button>
          <span className="px-3 text-xs font-mono text-white font-bold text-center flex-1 md:flex-none">{format(currentPeriodStart, 'yyyy/MM')} - {format(currentPeriodEnd, 'yyyy/MM')}</span>
          <button onClick={handleNextMonth} className="p-1 hover:text-amber-400 text-zinc-400"><ChevronRight size={16} /></button>
        </div>
      </div>
      
      {/* 中段 */}
      <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
        <div className="flex items-center bg-black/40 rounded border border-white/5 p-1 gap-1 min-w-max">
           {['all', 'main', 'story', 'event', 'high_difficulty', 'gacha', 'campaign'].map(t => (
             <button key={t} onClick={() => setFilterType(t as any)} className={`px-3 md:px-2 py-1 md:py-0.5 text-[10px] font-bold rounded-sm uppercase flex-shrink-0 transition-colors ${filterType === t ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{t === 'high_difficulty' ? 'HIGH' : t}</button>
           ))}
        </div>
      </div>
      
      {/* 下段 */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end hidden md:flex">
        {lastUpdated && (
          <div className="flex items-center gap-2 px-3 py-1.5 border border-red-900/50 bg-red-900/10 rounded-sm">
            <Clock size={14} className="text-red-500" />
            <span className="text-xs font-mono font-bold text-red-500">UPDATE: {lastUpdated}</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/5">
          <MoveHorizontal size={14} className="text-zinc-500" /><input type="range" min="800" max="5000" value={canvasWidth} onChange={(e) => setCanvasWidth(Number(e.target.value))} className="w-24 md:w-32 accent-amber-400 cursor-pointer h-1" /><ZoomIn size={14} className="text-zinc-500" />
        </div>
        {enableAdminFeatures && (
           <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-amber-400 text-amber-400 font-bold text-xs uppercase hover:bg-amber-400 hover:text-black transition-colors rounded-sm"><Download size={14} /> EXPORT</button>
        )}
      </div>
    </header>
  );
};