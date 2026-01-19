import React from 'react';
import { GripVertical, Info } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { GameEvent, EventType, WeekMarker } from '../types';

interface TimelineCanvasProps {
  year: number;
  weeks: WeekMarker[];
  todayPercent: number | null;
  events: GameEvent[];
  filterType: EventType | 'all';
  canvasWidth: number;
  isAdmin: boolean;
  enableAdminFeatures: boolean;
  currentPeriodStart: Date;
  totalDaysInView: number;
  handleDragStart: (index: number) => void;
  handleDragEnter: (index: number) => void;
  handleDragEnd: () => void;
  handleEdit: (event: GameEvent) => void;
}

export const TimelineCanvas: React.FC<TimelineCanvasProps> = ({
  year,
  weeks,
  todayPercent,
  events,
  filterType,
  canvasWidth,
  isAdmin,
  enableAdminFeatures,
  currentPeriodStart,
  totalDaysInView,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
  handleEdit,
}) => {
  
  const getPosition = (dateStr: string) => {
    const date = parseISO(dateStr);
    const diff = differenceInDays(date, currentPeriodStart);
    return (diff / totalDaysInView) * 100;
  };

  const getWidth = (startStr: string, endStr: string) => {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const duration = differenceInDays(end, start) + 1;
    return (duration / totalDaysInView) * 100;
  };

  const getTypeColor = (type: EventType) => {
    switch(type) {
      case 'main': return 'bg-white text-black';
      case 'story': return 'bg-cyan-400 text-black';
      case 'event': return 'bg-emerald-500 text-black';
      case 'high_difficulty': return 'bg-purple-600 text-white';
      case 'gacha': return 'bg-red-600 text-white';
      case 'campaign': return 'bg-amber-400 text-black';
      default: return 'bg-zinc-500 text-white';
    }
  };
  
  const getTypeBarColor = (type: EventType) => {
    switch(type) {
      case 'main': return 'bg-zinc-200';
      case 'story': return 'bg-cyan-400';
      case 'event': return 'bg-emerald-500';
      case 'high_difficulty': return 'bg-purple-600';
      case 'gacha': return 'bg-red-600';
      case 'campaign': return 'bg-amber-400';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div id="schedule-canvas" className="bg-[#09090b] border border-zinc-800 relative shadow-2xl flex-shrink-0 transition-all duration-300 mx-auto" style={{ width: `${canvasWidth}px`, minHeight: '100%' }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#09090b] border-b border-zinc-800 shadow-xl">
        <div className="p-4 md:p-6 pb-2 flex flex-col md:flex-row justify-between items-start md:items-end relative z-20 bg-[#09090b] gap-2 md:gap-0">
          <div className="sticky left-0 z-30 bg-[#09090b]/95 backdrop-blur-sm pr-4 w-full md:w-auto">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Event Schedule</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-amber-400 text-black text-[8px] md:text-[10px] font-bold px-1">OFFICIAL_DATA</span>
              <p className="text-[10px] md:text-xs text-amber-400 font-mono tracking-widest">ARKNIGHTS: ENDFIELD</p>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-mono flex items-center gap-1">
              <Info size={10} />
              <span className="hidden md:inline">※開催期間は予告なく変更される場合があります。終了時期が未定のイベントは仮の日付で表示されています。</span>
              <span className="md:hidden">※期間は変更される場合があります。</span>
            </p>
            
            {/* ★修正箇所: 「素材」を「画像」に変更 */}
            <div className="mt-2 pt-2 border-t border-zinc-800/50">
              <p className="text-[9px] text-zinc-600 leading-relaxed font-sans">
                This is an unofficial fan site using official images. <br/>
                All images and contents are ©GRYPHLINE. <br/>
                当サイトは公式画像を使用した非公式ファンサイトであり、運営企業とは一切関係ありません。
              </p>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 md:static md:text-right">
             <div className="text-3xl md:text-5xl font-bold text-zinc-800 font-mono select-none">{year}</div>
          </div>
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400 z-40"></div><div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400 z-40"></div>
        </div>
        <div className="h-6 md:h-8 w-full relative border-t border-zinc-800 bg-[#09090b]">
            {weeks.map((week, i) => (<div key={`header-${i}`} className="absolute bottom-1 text-[10px] md:text-sm text-zinc-300 font-bold font-mono -ml-3" style={{ left: `${week.percent}%` }}>{week.label}</div>))}
            {todayPercent !== null && (<div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-50" style={{ left: `${todayPercent}%` }}><div className="absolute -top-1 left-1 bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 whitespace-nowrap rounded-sm shadow-md">TODAY</div></div>)}
        </div>
      </div>

      <div className="relative p-4 md:p-6 min-h-[600px] bg-[#09090b] overflow-hidden">
        <div className="absolute inset-0 px-0 z-0 pointer-events-none">{weeks.map((week, i) => (<div key={`line-${i}`} className="absolute top-0 bottom-0 border-l border-zinc-700 opacity-40" style={{ left: `${week.percent}%` }}></div>))}</div>
        {todayPercent !== null && (<div className="absolute top-0 bottom-0 z-[40] pointer-events-none" style={{ left: `${todayPercent}%`, width: '2px', backgroundColor: '#EF4444', boxShadow: '0 0 10px 2px rgba(239, 68, 68, 0.6)' }}></div>)}

        <div className="relative z-10 space-y-8 md:space-y-10 pt-4">
          {events.filter(e => filterType === 'all' || e.type === filterType).map((event, index) => {
            const leftPosPercent = getPosition(event.startDate);
            const widthPercent = getWidth(event.startDate, event.endDate);
            if ((leftPosPercent + widthPercent) < 0 || leftPosPercent > 100) return null;
            const pixelsPerPercent = canvasWidth / 100;
            const hiddenLeftPixels = leftPosPercent < 0 ? Math.abs(leftPosPercent) * pixelsPerPercent : 0;
            const barTotalWidthPx = widthPercent * pixelsPerPercent;
            const safePadding = Math.min(hiddenLeftPixels, Math.max(0, barTotalWidthPx - 100));

            return (
              <div key={event.id} className="relative group" draggable={isAdmin && enableAdminFeatures && filterType === 'all'} onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} style={{ left: `${leftPosPercent}%`, width: `${widthPercent}%`, position: 'relative', cursor: (isAdmin && enableAdminFeatures && filterType === 'all') ? 'grab' : 'default' }}>
                  <div className="w-full relative">
                    <div className="flex items-center gap-2 mb-1" style={{ paddingLeft: `${safePadding}px`, transition: 'padding-left 0.05s linear' }}>
                        {(isAdmin && enableAdminFeatures && filterType === 'all') && <div className="text-zinc-600 hover:text-amber-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><GripVertical size={16} /></div>}
                        <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider flex-shrink-0 ${getTypeColor(event.type)}`}>{event.type.toUpperCase()}</span>
                        <span className="text-xs md:text-sm font-bold text-zinc-200 drop-shadow-md shadow-black whitespace-nowrap cursor-pointer hover:underline flex-shrink-0" onClick={() => handleEdit(event)}>{event.title}</span>
                        <span className="text-[9px] md:text-[10px] text-zinc-500 font-mono whitespace-nowrap ml-1 opacity-70 flex-shrink-0">{format(parseISO(event.startDate), 'MM/dd')} - {format(parseISO(event.endDate), 'MM/dd')}</span>
                    </div>
                    <div className={`w-full ${getTypeBarColor(event.type)} shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-sm border border-white/10`} style={{ height: event.bannerImage ? 'auto' : '3.5rem' }} onClick={() => handleEdit(event)}>
                      {event.bannerImage ? <img src={event.bannerImage} alt="Banner" className="w-full h-auto block opacity-100 transition-opacity" /> : <div className="absolute inset-0 w-full h-full opacity-30" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '8px 8px' }}></div>}
                    </div>
                  </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative z-50 bg-[#09090b] border-t border-zinc-800 p-4 flex justify-end"><div className="text-[10px] text-zinc-600 font-mono">SYS: ONLINE | CLOUD SYNC ACTIVE</div><div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400"></div><div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400"></div></div>
    </div>
  );
};