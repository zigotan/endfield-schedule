// src/components/EventModal.tsx
import React from 'react';
import { X, Calendar, Clock, AlignLeft, ExternalLink } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { GameEvent, EventType } from '../types';

interface EventModalProps {
  event: GameEvent;
  onClose: () => void;
  nextUpdateDate: string;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose, nextUpdateDate }) => {
  if (!event) return null;

  const CHANNEL_LABEL = "SITE ADMIN"; 
  const CHANNEL_NAME = "じごちゃんねる【エンドフィールド支部】";
  const CHANNEL_URL = "https://www.youtube.com/channel/UCTv10NGVzs91keuRNy4z9Fg?sub_confirmation=1";
  const CHANNEL_ICON_URL = "/icon.png"; 

  const generateGoogleCalendarUrl = () => {
    const start = format(parseISO(event.startDate), 'yyyyMMdd');
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
  
  const endDateDisplay = event.endDate === nextUpdateDate 
    ? 'バージョンアップメンテナンス前' 
    : format(parseISO(event.endDate), 'yyyy/MM/dd');

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      {/* ★修正: max-h-[85vh] と flex flex-col を追加して、画面からはみ出さないように制限 */}
      <div className="bg-[#18181b] w-full max-w-lg max-h-[85vh] flex flex-col rounded-lg border border-zinc-700 shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors">
          <X size={20} />
        </button>

        {/* ★修正: flex-shrink-0 を追加して、スクロール時も画像が潰れないようにする */}
        <div className="relative w-full aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden flex-shrink-0">
          {event.bannerImage ? (
            <img src={event.bannerImage} alt={event.title} className="w-full h-full object-contain" />
          ) : (
            <div className="text-zinc-700 font-mono text-4xl font-bold opacity-20 select-none">NO IMAGE</div>
          )}
          
          <div className="absolute bottom-0 left-0 p-4 w-full pointer-events-none">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg ${getTypeColor(event.type)}`}>
              {event.type.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ★修正: overflow-y-auto をここに追加。画像より下の部分だけスクロールさせる */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight mb-2">{event.title}</h2>
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
              <Clock size={16} className="text-amber-400" />
              <span>{format(parseISO(event.startDate), 'yyyy/MM/dd')}</span>
              <span>-</span>
              <span className={event.endDate === nextUpdateDate ? "text-cyan-400 font-bold" : ""}>{endDateDisplay}</span>
            </div>
          </div>

          {event.description && (
            // ★修正: 説明文自体のスクロール(max-h-60)は削除し、親のスクロールに任せる形に変更
            <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold mb-2 uppercase sticky top-0 bg-[#18181b]/0">
                <AlignLeft size={14} /> Details
              </div>
              <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          <div className="space-y-4 pb-2"> {/* 下部に少し余白を追加 */}
            <a 
              href={generateGoogleCalendarUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded border border-zinc-700 transition-all hover:border-amber-400 group"
            >
              <Calendar size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Add to Google Calendar</span>
            </a>

            {/* チャンネル登録促進バナー */}
            <a 
              href={CHANNEL_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-lg p-3 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-600 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform bg-black">
                    <img src={CHANNEL_ICON_URL} alt="Channel Icon" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">{CHANNEL_LABEL}</div>
                    <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">{CHANNEL_NAME}</div>
                    <div className="text-[10px] text-zinc-500 truncate">エンドフィールドの最新攻略情報を配信中！</div>
                 </div>
                 <div className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    SUBSCRIBE <ExternalLink size={10} />
                 </div>
              </div>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};