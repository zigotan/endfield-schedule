// src/components/EventModal.tsx
import React from 'react';
import { X, Calendar, Clock, AlignLeft } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { GameEvent, EventType } from '../types';

interface EventModalProps {
  event: GameEvent;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  // Googleカレンダー用リンク生成
  const generateGoogleCalendarUrl = () => {
    const start = format(parseISO(event.startDate), 'yyyyMMdd');
    // Googleカレンダーの終了日は「翌日」にする必要があるため+1日
    const end = format(addDays(parseISO(event.endDate), 1), 'yyyyMMdd');
    const details = event.description || '';
    
    const url = new URL('https://www.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    url.searchParams.append('dates', `${start}/${end}`);
    url.searchParams.append('details', details);
    return url.toString();
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

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#18181b] w-full max-w-lg rounded-lg border border-zinc-700 shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
        
        {/* 閉じるボタン */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors">
          <X size={20} />
        </button>

        {/* ヘッダー画像エリア */}
        <div className="relative w-full aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden">
          {event.bannerImage ? (
            <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-zinc-700 font-mono text-4xl font-bold opacity-20 select-none">NO IMAGE</div>
          )}
          <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/90 to-transparent w-full">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getTypeColor(event.type)}`}>
              {event.type.toUpperCase()}
            </span>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight mb-2">{event.title}</h2>
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
              <Clock size={16} className="text-amber-400" />
              <span>{format(parseISO(event.startDate), 'yyyy/MM/dd')}</span>
              <span>-</span>
              <span>{format(parseISO(event.endDate), 'yyyy/MM/dd')}</span>
            </div>
          </div>

          {/* 詳細テキスト */}
          {event.description && (
            <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold mb-2 uppercase">
                <AlignLeft size={14} /> Details
              </div>
              <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Googleカレンダーボタン */}
          <a 
            href={generateGoogleCalendarUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded border border-zinc-700 transition-all hover:border-amber-400 group"
          >
            <Calendar size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Add to Google Calendar</span>
          </a>
        </div>
      </div>
    </div>
  );
};