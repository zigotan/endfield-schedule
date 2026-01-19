"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, Plus, Trash2, Download, Monitor, Image as ImageIcon, X, FileJson, Edit3, ZoomIn, MoveHorizontal, RotateCcw, Calendar as CalendarIcon, Crosshair, Bug, GripVertical, ChevronLeft, ChevronRight, History, FileDown, RefreshCw, AlertTriangle, Filter, Clock, Cloud, Lock, Unlock
} from 'lucide-react';
import { differenceInDays, parseISO, startOfYear, format, nextMonday, isMonday, addDays, addMonths, endOfMonth, isWithinInterval } from 'date-fns';
import { toPng } from 'html-to-image';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Client (読み取り専用) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- 型定義 ---
type EventType = 'main' | 'story' | 'event' | 'high_difficulty' | 'gacha' | 'campaign';

interface GameEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: EventType;
  bannerImage?: string; 
}

interface WeekMarker {
  percent: number;
  label: string;
}

export default function Home() {
  // --- データ管理 ---
  const [year, setYear] = useState(2026);
  const [viewStartMonth, setViewStartMonth] = useState(0); 
  const [activeTab, setActiveTab] = useState<'timeline' | 'calendar'>('timeline');
  const [canvasWidth, setCanvasWidth] = useState(1600);
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [todayPercent, setTodayPercent] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [weeks, setWeeks] = useState<WeekMarker[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 管理者モード
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 期間計算
  const currentPeriodStart = new Date(year, viewStartMonth, 1);
  const currentPeriodEnd = endOfMonth(addMonths(currentPeriodStart, 3)); 
  const totalDaysInView = differenceInDays(currentPeriodEnd, currentPeriodStart) + 1;

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 初期化 & データ取得 ---
  useEffect(() => {
    const fetchCloudData = async () => {
      // Supabaseからデータ取得 (読み取り専用)
      const { data, error } = await supabase
        .from('game_events')
        .select('data, updated_at')
        .eq('id', 'master_schedule')
        .single();

      if (data && data.data) {
        setEvents(data.data as GameEvent[]);
        if (data.updated_at) {
          setLastUpdated(format(new Date(data.updated_at), 'yyyy/MM/dd HH:mm'));
        }
      } else {
        // データがない場合は初期値
        setEvents([{ id: '1', title: 'Welcome to Endfield Schedule', startDate: '2026-01-22', endDate: '2026-02-10', type: 'main' }]);
      }
      setIsLoaded(true);
    };

    fetchCloudData();
  }, []);

  // --- 期間変更ごとの再計算 ---
  useEffect(() => {
    const now = new Date();
    if (isWithinInterval(now, { start: currentPeriodStart, end: currentPeriodEnd })) {
      const diff = differenceInDays(now, currentPeriodStart);
      const percent = (diff / totalDaysInView) * 100;
      setTodayPercent(percent);
    } else {
      setTodayPercent(null);
    }
    setDebugInfo(`RANGE:${format(currentPeriodStart, 'yyyy/MM')}-${format(currentPeriodEnd, 'MM')} | DAYS:${totalDaysInView}`);

    const weekMarkers: WeekMarker[] = [];
    let currentDate = currentPeriodStart;
    if (!isMonday(currentDate)) currentDate = nextMonday(currentDate);

    while (currentDate <= currentPeriodEnd) {
      const dayDiff = differenceInDays(currentDate, currentPeriodStart);
      const posPercent = (dayDiff / totalDaysInView) * 100;
      if (posPercent >= 0 && posPercent <= 100) {
        weekMarkers.push({ percent: posPercent, label: format(currentDate, 'M/d') });
      }
      currentDate = addDays(currentDate, 7);
    }
    setWeeks(weekMarkers);
  }, [year, viewStartMonth, totalDaysInView]);

  // --- クラウド同期 (書き込み) ---
  const syncToCloud = async (newEvents: GameEvent[]) => {
    if (!isAdmin) return; // 管理者でなければ何もしない
    setIsSyncing(true);
    
    // API経由で安全に書き込み
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput, events: newEvents }),
      });

      if (!res.ok) throw new Error('Auth Failed');
      
      const nowStr = format(new Date(), 'yyyy/MM/dd HH:mm');
      setLastUpdated(nowStr);
    } catch (e) {
      alert('Sync Failed: Incorrect Password or Network Error');
      setIsAdmin(false); // 失敗したらログアウト
    } finally {
      setIsSyncing(false);
    }
  };

  // --- 認証 ---
  const handleLogin = () => {
    if (passwordInput) {
      setIsAdmin(true); // 仮ログイン（実際の認証は保存時にAPIで行う）
      setShowLoginModal(false);
    }
  };

  // --- 操作系 (変更があったら syncToCloud を呼ぶ) ---
  const handleEditSave = (newEvents: GameEvent[]) => {
    setEvents(newEvents);
    syncToCloud(newEvents);
  };

  // 入力フォーム状態
  const [inputTitle, setInputTitle] = useState('');
  const [inputStart, setInputStart] = useState('2026-01-22');
  const [inputEnd, setInputEnd] = useState('2026-02-10');
  const [inputType, setInputType] = useState<EventType>('event');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSaveEntry = () => {
    if (!inputTitle || !inputStart || !inputEnd) return;
    const newEvent: GameEvent = {
      id: isEditing && editingId ? editingId : Date.now().toString(),
      title: inputTitle,
      startDate: inputStart,
      endDate: inputEnd,
      type: inputType,
      bannerImage: inputImage || undefined,
    };
    const newEvents = isEditing && editingId 
      ? events.map(e => e.id === editingId ? newEvent : e)
      : [...events, newEvent];
    
    handleEditSave(newEvents);
    setIsEditing(false);
    setEditingId(null);
    setInputTitle('');
    setInputImage(null);
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if(confirm("Delete this event?")) {
      const newEvents = events.filter(e => e.id !== id);
      handleEditSave(newEvents);
    }
  };

  // ★復元: ドラッグ＆ドロップ関連
  const handleDragStart = (position: number) => { dragItem.current = position; };
  const handleDragEnter = (position: number) => { dragOverItem.current = position; };
  const handleDragEnd = () => {
    if (filterType !== 'all' || !isAdmin) return;
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const _events = [...events];
      const draggedItemContent = _events[dragItem.current];
      _events.splice(dragItem.current, 1);
      _events.splice(dragOverItem.current, 0, draggedItemContent);
      handleEditSave(_events);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // ★復元: 計算ロジック (これが無いとエラーになります)
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

  // その他UI操作
  const handlePrevMonth = () => setViewStartMonth(prev => prev - 1);
  const handleNextMonth = () => setViewStartMonth(prev => prev + 1);
  
  // ★復元: Todayジャンプ
  const handleJumpToToday = () => {
    if (todayPercent === null) {
      const now = new Date();
      if (now.getFullYear() === year) setViewStartMonth(now.getMonth());
      return;
    }
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      const pixelPos = (canvasWidth * todayPercent) / 100;
      const containerCenter = scrollContainer.clientWidth / 2;
      let targetScroll = pixelPos - containerCenter;
      scrollContainer.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  const handleExport = async () => {
    const element = document.getElementById('schedule-canvas');
    if (element) {
      const targetWidth = 1200;
      const targetHeight = element.scrollHeight;
      const dataUrl = await toPng(element, { backgroundColor: '#09090b', width: targetWidth, height: targetHeight, style: { width: `${targetWidth}px`, height: 'auto', overflow: 'visible', maxHeight: 'none' } });
      const link = document.createElement('a');
      link.download = `endfield_schedule.png`;
      link.href = dataUrl;
      link.click();
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setInputImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleEdit = (event: GameEvent) => {
    if (!isAdmin) return; // 閲覧者は編集不可
    setIsEditing(true);
    setEditingId(event.id);
    setInputTitle(event.title);
    setInputStart(event.startDate);
    setInputEnd(event.endDate);
    setInputType(event.type);
    setInputImage(event.bannerImage || null);
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

  if (!isLoaded) return <div className="h-screen w-full bg-[#09090b] flex items-center justify-center text-zinc-500 font-mono">CONNECTING TO SATELLITE...</div>;

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-200 font-sans selection:bg-amber-400 selection:text-black overflow-hidden">
      
      {/* --- 左パネル (管理者のみ表示) --- */}
      {isAdmin && (
        <aside className="w-80 flex flex-col border-r border-zinc-800 bg-[#18181b] z-20 shadow-xl flex-shrink-0">
          <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-wider text-amber-400 uppercase flex items-center gap-2">
              <Monitor size={20} /> ADMIN
            </h1>
            <button onClick={() => setIsAdmin(false)} className="text-[10px] bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-900">LOGOUT</button>
          </div>
          
          <div className="p-5 space-y-4 border-b border-zinc-800 bg-zinc-900/50 overflow-y-auto max-h-[60vh]">
            <div className="flex justify-between items-center">
               <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{isEditing ? 'EDIT ENTRY' : 'NEW ENTRY'}</h2>
               {isEditing && <button onClick={() => setIsEditing(false)} className="text-[10px] text-red-400 hover:underline">CANCEL</button>}
            </div>
            <div className="space-y-1"><label className="text-xs text-zinc-500">Title</label><input type="text" value={inputTitle} onChange={(e) => setInputTitle(e.target.value)} className="w-full bg-black border border-zinc-700 p-2 text-sm text-white focus:border-amber-400 outline-none rounded-sm" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><label className="text-xs text-zinc-500">Start</label><input type="date" value={inputStart} onChange={(e) => setInputStart(e.target.value)} className="w-full bg-black border border-zinc-700 p-2 text-sm text-white rounded-sm" /></div>
              <div className="space-y-1"><label className="text-xs text-zinc-500">End</label><input type="date" value={inputEnd} onChange={(e) => setInputEnd(e.target.value)} className="w-full bg-black border border-zinc-700 p-2 text-sm text-white rounded-sm" /></div>
            </div>
            <div className="space-y-1"><label className="text-xs text-zinc-500">Type</label>
              <select value={inputType} onChange={(e) => setInputType(e.target.value as EventType)} className="w-full bg-black border border-zinc-700 p-2 text-sm text-white rounded-sm">
                <option value="main">Main (White)</option><option value="story">Story (Cyan)</option><option value="event">Event (Green)</option><option value="high_difficulty">High-Diff (Purple)</option><option value="gacha">Gacha (Red)</option><option value="campaign">Campaign (Yellow)</option>
              </select>
            </div>
            <div className="space-y-1"><label className="text-xs text-zinc-500">Image</label>
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-zinc-800 border border-zinc-700 p-2 text-xs text-zinc-300 rounded-sm flex justify-center gap-2"><ImageIcon size={14}/> {inputImage ? 'Change' : 'Select'}</button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            </div>
            <button onClick={handleSaveEntry} disabled={isSyncing} className="w-full py-2 mt-4 bg-amber-400 text-black font-bold text-sm uppercase hover:bg-white rounded-sm disabled:opacity-50">
              {isSyncing ? 'SYNCING...' : (isEditing ? 'UPDATE' : 'ADD DATA')}
            </button>
          </div>
        </aside>
      )}

      {/* === 中央パネル === */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative bg-[#09090b] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        {/* ツールバー */}
        <header className="flex-none h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#18181b]/80 backdrop-blur-md z-50 relative">
          <div className="flex items-center gap-2">
            {!isAdmin && (
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
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-amber-400 text-amber-400 font-bold text-xs uppercase hover:bg-amber-400 hover:text-black transition-colors rounded-sm"><Download size={14} /> EXPORT</button>
          </div>
        </header>

        {/* LOGIN MODAL */}
        {showLoginModal && (
          <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
             <div className="w-80 bg-[#18181b] border border-amber-400/50 p-6 rounded shadow-2xl text-center">
               <h3 className="text-amber-400 font-bold text-lg mb-4 flex justify-center gap-2"><Lock /> SECURITY CHECK</h3>
               <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="ENTER PASSWORD" className="w-full bg-black border border-zinc-700 p-2 text-white text-center font-mono mb-4 focus:border-amber-400 outline-none" />
               <div className="flex gap-2">
                 <button onClick={() => setShowLoginModal(false)} className="flex-1 py-2 border border-zinc-700 text-zinc-400 hover:text-white">CANCEL</button>
                 <button onClick={handleLogin} className="flex-1 py-2 bg-amber-400 text-black font-bold hover:bg-white">ACCESS</button>
               </div>
             </div>
          </div>
        )}

        {/* スクロールエリア */}
        <div id="main-scroll-container" className="flex-1 overflow-auto flex items-start relative z-0">
          <div id="schedule-canvas" className="bg-[#09090b] border border-zinc-800 relative shadow-2xl flex-shrink-0 transition-all duration-300 mx-auto" style={{ width: `${canvasWidth}px`, minHeight: '100%' }}>
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-[#09090b] border-b border-zinc-800 shadow-xl">
              <div className="p-6 pb-2 flex justify-between items-end relative z-20 bg-[#09090b]">
                <div className="sticky left-0 z-30 bg-[#09090b]/95 backdrop-blur-sm pr-4">
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Event Schedule</h2>
                  <div className="flex items-center gap-2 mt-1"><span className="bg-amber-400 text-black text-[10px] font-bold px-1">OFFICIAL_DATA</span><p className="text-xs text-amber-400 font-mono tracking-widest">ARKNIGHTS: ENDFIELD</p></div>
                </div>
                <div className="text-right"><div className="text-5xl font-bold text-zinc-800 font-mono select-none">{year}</div></div>
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400 z-40"></div><div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400 z-40"></div>
              </div>
              <div className="h-8 w-full relative border-t border-zinc-800 bg-[#09090b]">
                 {weeks.map((week, i) => (<div key={`header-${i}`} className="absolute bottom-1 text-sm text-zinc-300 font-bold font-mono -ml-3" style={{ left: `${week.percent}%` }}>{week.label}</div>))}
                 {todayPercent !== null && (<div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-50" style={{ left: `${todayPercent}%` }}><div className="absolute -top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 whitespace-nowrap rounded-sm shadow-md">TODAY</div></div>)}
              </div>
            </div>

            <div className="relative p-6 min-h-[600px] bg-[#09090b] overflow-hidden">
              <div className="absolute inset-0 px-0 z-0 pointer-events-none">{weeks.map((week, i) => (<div key={`line-${i}`} className="absolute top-0 bottom-0 border-l border-zinc-700 opacity-40" style={{ left: `${week.percent}%` }}></div>))}</div>
              {todayPercent !== null && (<div className="absolute top-0 bottom-0 z-[40] pointer-events-none" style={{ left: `${todayPercent}%`, width: '2px', backgroundColor: '#EF4444', boxShadow: '0 0 10px 2px rgba(239, 68, 68, 0.6)' }}></div>)}

              <div className="relative z-10 space-y-10 pt-4">
                {events.filter(e => filterType === 'all' || e.type === filterType).map((event, index) => {
                  const leftPosPercent = getPosition(event.startDate);
                  const widthPercent = getWidth(event.startDate, event.endDate);
                  if ((leftPosPercent + widthPercent) < 0 || leftPosPercent > 100) return null;
                  const pixelsPerPercent = canvasWidth / 100;
                  const hiddenLeftPixels = leftPosPercent < 0 ? Math.abs(leftPosPercent) * pixelsPerPercent : 0;
                  const barTotalWidthPx = widthPercent * pixelsPerPercent;
                  const safePadding = Math.min(hiddenLeftPixels, Math.max(0, barTotalWidthPx - 100));

                  return (
                    <div key={event.id} className="relative group" draggable={isAdmin && filterType === 'all'} onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} style={{ left: `${leftPosPercent}%`, width: `${widthPercent}%`, position: 'relative', cursor: (isAdmin && filterType === 'all') ? 'grab' : 'default' }}>
                       <div className="w-full relative">
                          <div className="flex items-center gap-2 mb-1" style={{ paddingLeft: `${safePadding}px`, transition: 'padding-left 0.05s linear' }}>
                             {(isAdmin && filterType === 'all') && <div className="text-zinc-600 hover:text-amber-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><GripVertical size={16} /></div>}
                             <span className={`text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider flex-shrink-0 ${getTypeColor(event.type)}`}>{event.type.toUpperCase()}</span>
                             <span className="text-sm font-bold text-zinc-200 drop-shadow-md shadow-black whitespace-nowrap cursor-pointer hover:underline flex-shrink-0" onClick={() => handleEdit(event)}>{event.title}</span>
                             <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap ml-1 opacity-70 flex-shrink-0">{format(parseISO(event.startDate), 'MM/dd')} - {format(parseISO(event.endDate), 'MM/dd')}</span>
                          </div>
                          <div className={`w-full ${getTypeBarColor(event.type)} shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-sm border border-white/10`} style={{ height: event.bannerImage ? 'auto' : '4rem' }} onClick={() => handleEdit(event)}>
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
        </div>
      </main>
    </div>
  );
}