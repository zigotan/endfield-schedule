"use client";

import React, { useState, useRef, useEffect } from 'react';
import { differenceInDays, format, nextMonday, isMonday, addDays, addMonths, endOfMonth, isWithinInterval } from 'date-fns';
import { toPng } from 'html-to-image';
import { createClient } from '@supabase/supabase-js';

// 作成したコンポーネントを3つとも読み込み
import { GameEvent, EventType, WeekMarker } from '../types';
import { AdminPanel } from '../components/AdminPanel';
import { Toolbar } from '../components/Toolbar';
import { TimelineCanvas } from '../components/TimelineCanvas'; // ★追加

// --- Supabase Client ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  // --- データ管理 ---
  const [year, setYear] = useState(2026);
  const [viewStartMonth, setViewStartMonth] = useState(0); 
  const [canvasWidth, setCanvasWidth] = useState(1600);
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [todayPercent, setTodayPercent] = useState<number | null>(null);
  const [weeks, setWeeks] = useState<WeekMarker[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 管理者機能設定
  const enableAdminFeatures = process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';
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

  // --- 初期化 & データ取得 ---
  useEffect(() => {
    const fetchCloudData = async () => {
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

  // --- クラウド同期 ---
  const syncToCloud = async (newEvents: GameEvent[]) => {
    if (!isAdmin) return;
    setIsSyncing(true);
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
      setIsAdmin(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = () => {
    if (passwordInput) {
      setIsAdmin(true);
      setShowLoginModal(false);
    }
  };

  const handleEditSave = (newEvents: GameEvent[]) => {
    setEvents(newEvents);
    syncToCloud(newEvents);
  };

  // 編集フォーム状態
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

  // ドラッグ操作
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

  // 月移動
  const handlePrevMonth = () => setViewStartMonth(prev => prev - 1);
  const handleNextMonth = () => setViewStartMonth(prev => prev + 1);
  
  // エクスポート
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
    if (!isAdmin) return;
    setIsEditing(true);
    setEditingId(event.id);
    setInputTitle(event.title);
    setInputStart(event.startDate);
    setInputEnd(event.endDate);
    setInputType(event.type);
    setInputImage(event.bannerImage || null);
  };

  const handleJsonExport = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `endfield_backup_${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if(confirm('現在のデータを上書きして読み込みますか？\n(注意: 現在の画面のデータは消えます)')) {
             handleEditSave(json);
             alert('読み込み成功！データが更新されました。');
          }
        } else {
          alert('ファイル形式が正しくありません');
        }
      } catch (err) {
        alert('読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
  };

  if (!isLoaded) return <div className="h-screen w-full bg-[#09090b] flex items-center justify-center text-zinc-500 font-mono">CONNECTING TO SATELLITE...</div>;

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-200 font-sans selection:bg-amber-400 selection:text-black overflow-hidden">
      
      {/* 1. 左パネル (管理者用) */}
      {isAdmin && enableAdminFeatures && (
        <AdminPanel
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            inputTitle={inputTitle}
            setInputTitle={setInputTitle}
            inputStart={inputStart}
            setInputStart={setInputStart}
            inputEnd={inputEnd}
            setInputEnd={setInputEnd}
            inputType={inputType}
            setInputType={setInputType}
            inputImage={inputImage}
            handleImageUpload={handleImageUpload}
            handleSaveEntry={handleSaveEntry}
            isSyncing={isSyncing}
            handleJsonExport={handleJsonExport}
            handleJsonImport={handleJsonImport}
        />
      )}

      {/* 2. メインエリア */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative bg-[#09090b] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        {/* 2-1. ツールバー */}
        <Toolbar
          currentPeriodStart={currentPeriodStart}
          currentPeriodEnd={currentPeriodEnd}
          handlePrevMonth={handlePrevMonth}
          handleNextMonth={handleNextMonth}
          filterType={filterType}
          setFilterType={setFilterType}
          lastUpdated={lastUpdated}
          canvasWidth={canvasWidth}
          setCanvasWidth={setCanvasWidth}
          handleExport={handleExport}
          enableAdminFeatures={enableAdminFeatures}
          isAdmin={isAdmin}
          setShowLoginModal={setShowLoginModal}
        />

        {/* 2-2. ログインモーダル */}
        {showLoginModal && (
          <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
             <div className="w-80 bg-[#18181b] border border-amber-400/50 p-6 rounded shadow-2xl text-center">
               <div className="text-amber-400 font-bold text-lg mb-4 flex justify-center gap-2 items-center">SECURITY CHECK</div>
               <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="ENTER PASSWORD" className="w-full bg-black border border-zinc-700 p-2 text-white text-center font-mono mb-4 focus:border-amber-400 outline-none" />
               <div className="flex gap-2">
                 <button onClick={() => setShowLoginModal(false)} className="flex-1 py-2 border border-zinc-700 text-zinc-400 hover:text-white">CANCEL</button>
                 <button onClick={handleLogin} className="flex-1 py-2 bg-amber-400 text-black font-bold hover:bg-white">ACCESS</button>
               </div>
             </div>
          </div>
        )}

        {/* 2-3. スクロールエリア (タイムライン本体) */}
        <div id="main-scroll-container" className="flex-1 overflow-auto flex items-start relative z-0">
          <TimelineCanvas 
            year={year}
            weeks={weeks}
            todayPercent={todayPercent}
            events={events}
            filterType={filterType}
            canvasWidth={canvasWidth}
            isAdmin={isAdmin}
            enableAdminFeatures={enableAdminFeatures}
            currentPeriodStart={currentPeriodStart}
            totalDaysInView={totalDaysInView}
            handleDragStart={handleDragStart}
            handleDragEnter={handleDragEnter}
            handleDragEnd={handleDragEnd}
            handleEdit={handleEdit}
          />
        </div>
      </main>
    </div>
  );
}