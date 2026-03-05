// src/components/AdminPanel.tsx
import React from 'react';
import { Monitor, ImageIcon, FileDown, FileJson, AlignLeft } from 'lucide-react';
import { EventType } from '../types';

interface AdminPanelProps {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  inputTitle: string;
  setInputTitle: (v: string) => void;
  inputStart: string;
  setInputStart: (v: string) => void;
  inputEnd: string;
  setInputEnd: (v: string) => void;
  inputDesc: string;
  setInputDesc: (v: string) => void;
  inputType: EventType;
  setInputType: (v: EventType) => void;
  inputImage: string | null;
  setInputImage: (v: string | null) => void;
  handleSaveEntry: () => void;
  handlePublishEntry: () => void;
  handlePublishAll: () => void;
  handleImageUpload: (file: File) => Promise<string | null>;
  isSyncing: boolean;
  nextUpdateDate: string;
  setNextUpdateDate: (v: string) => void;
  handleSaveConfig: () => void;
  handleJsonExport: () => void;
  handleJsonImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteEvent: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isAdmin, setIsAdmin,
  isEditing, setIsEditing,
  inputTitle, setInputTitle,
  inputStart, setInputStart,
  inputEnd, setInputEnd,
  inputDesc, setInputDesc,
  inputType, setInputType,
  inputImage, setInputImage,
  handleSaveEntry, handlePublishEntry, handlePublishAll, handleImageUpload, isSyncing,
  nextUpdateDate, setNextUpdateDate, handleSaveConfig,
  handleJsonExport, handleJsonImport,
  handleDeleteEvent
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルのみアップロード可能です');
        return;
      }
      const url = await handleImageUpload(file);
      if (url) {
        setInputImage(url);
      }
    }
  };

  if (!isAdmin) return null;

  return (
    <aside className="w-80 flex flex-col border-r border-zinc-800 bg-[#18181b] z-20 shadow-xl flex-shrink-0">
      <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider text-amber-400 uppercase flex items-center gap-2">
          <Monitor size={20} /> ADMIN
        </h1>
        <button onClick={() => setIsAdmin(false)} className="text-[10px] bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-900">LOGOUT</button>
      </div>

      <div className="p-5 space-y-4 border-b border-zinc-800 bg-zinc-900/50 overflow-y-auto max-h-[calc(100vh-80px)]">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{isEditing ? 'EDIT ENTRY' : 'NEW ENTRY'}</h2>
          {isEditing && <button onClick={() => setIsEditing(false)} className="text-[10px] text-red-400 hover:underline">CANCEL</button>}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Title</label>
          <input type="text" value={inputTitle} onChange={(e) => setInputTitle(e.target.value)} className="w-full bg-black border border-zinc-700 p-2 text-sm text-white focus:border-amber-400 outline-none rounded-sm" placeholder="Event Title" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1"><label className="text-xs text-zinc-500">Start</label><input type="date" value={inputStart} onChange={(e) => setInputStart(e.target.value)} className="w-full bg-black border border-zinc-700 p-2 text-sm text-white rounded-sm" /></div>
          <div className="space-y-1"><label className="text-xs text-zinc-500">End</label><input type="date" value={inputEnd} onChange={(e) => setInputEnd(e.target.value)} className="w-full bg-black border border-zinc-700 p-2 text-sm text-white rounded-sm" /></div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Type</label>
          <select value={inputType} onChange={(e) => setInputType(e.target.value as EventType)} className="w-full bg-black border border-zinc-700 p-2 text-sm text-white rounded-sm">
            <option value="main">Main (White)</option><option value="story">Story (Cyan)</option><option value="event">Event (Green)</option><option value="high_difficulty">High-Diff (Purple)</option><option value="gacha">Gacha (Red)</option><option value="campaign">Campaign (Yellow)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500 flex items-center gap-1"><AlignLeft size={10} /> Description</label>
          <textarea
            value={inputDesc}
            onChange={(e) => setInputDesc(e.target.value)}
            className="w-full bg-black border border-zinc-700 p-2 text-xs text-white rounded-sm h-24 resize-none focus:border-amber-400 outline-none"
            placeholder="Event details, descriptions, etc..."
          />
        </div>

        {/* ★ドラッグ＆ドロップ対応の画像入力エリア */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 flex items-center gap-1"><ImageIcon size={10} /> Image Path / Drop File</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full min-h-16 border-2 border-dashed rounded-sm p-2 flex flex-col justify-center items-center transition-colors ${isDragging ? 'border-amber-400 bg-amber-400/10' : 'border-zinc-700 bg-black'} ${isSyncing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              type="text"
              value={inputImage || ''}
              onChange={(e) => setInputImage(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-white focus:outline-none mb-1 text-center font-mono"
              placeholder="例: /images/event.png または D&Dで追加"
            />
            {inputImage && (
              <div className="mt-1 rounded overflow-hidden relative group max-h-32 flex items-center justify-center pointer-events-none">
                <img src={inputImage} alt="Preview" className="w-full h-auto opacity-80" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">※この枠内に画像をドラッグ＆ドロップすると自動保存されます</p>
        </div>

        <div className="flex gap-2 mt-4 flex-col">
          <div className="flex gap-2">
            <button onClick={handleSaveEntry} disabled={isSyncing} className="flex-1 py-3 bg-zinc-800 text-white font-bold text-xs uppercase hover:bg-zinc-700 rounded-sm disabled:opacity-50 transition-colors border border-zinc-700 tracking-wider">
              {isEditing ? 'UPDATE ONLY' : 'ADD ONLY'}
            </button>
            {isEditing && (
              <button onClick={handleDeleteEvent} disabled={isSyncing} className="w-12 py-3 bg-red-900/50 text-red-500 font-bold text-[10px] uppercase hover:bg-red-900 hover:text-white rounded-sm disabled:opacity-50 border border-red-900 transition-colors">
                del
              </button>
            )}
          </div>
          <button onClick={handlePublishEntry} disabled={isSyncing} className="w-full py-3 bg-amber-400 text-black font-bold text-sm uppercase hover:bg-white rounded-sm disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.3)] tracking-wider">
            {isSyncing ? 'PROCESSING...' : (isEditing ? 'UPDATE & PUBLISH' : 'SAVE & PUBLISH 🚀')}
          </button>
        </div>

        <div className="pt-4 border-t border-zinc-800 mt-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">SYSTEM SETTINGS</h2>
          <div className="mb-4">
            <label className="text-[10px] text-zinc-500 mb-1 block">NEXT UPDATE DATE</label>
            <div className="flex gap-2">
              <input type="date" value={nextUpdateDate} onChange={(e) => setNextUpdateDate(e.target.value)} className="flex-1 bg-black border border-zinc-700 py-2 px-2 text-[10px] text-white rounded-sm focus:border-amber-400 outline-none" />
              <button onClick={handleSaveConfig} disabled={isSyncing} className="bg-zinc-800 border border-zinc-700 px-3 text-[10px] text-zinc-300 rounded-sm hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50">SAVE</button>
            </div>
            <p className="text-[9px] text-zinc-600 mt-1">※変更後、SAVEボタンでローカルに保存されます</p>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 mt-4 pb-12">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">BACKUP & DEPLOY</h2>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button onClick={handleJsonExport} className="flex items-center justify-center gap-1 bg-zinc-800 border border-zinc-700 py-2 px-1 text-[10px] text-zinc-300 rounded-sm hover:bg-zinc-700 hover:text-white transition-colors">
              <FileDown size={14} /> SAVE JSON
            </button>
            <label className="flex items-center justify-center gap-1 bg-zinc-800 border border-zinc-700 py-2 px-1 text-[10px] text-zinc-300 rounded-sm hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer">
              <FileJson size={14} /> LOAD JSON
              <input type="file" onChange={handleJsonImport} className="hidden" accept=".json" />
            </label>
          </div>
          <button onClick={handlePublishAll} disabled={isSyncing} className="w-full py-3 bg-white text-black font-bold text-xs uppercase hover:bg-amber-400 rounded-sm disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] tracking-wider">
            {isSyncing ? 'PUBLISHING...' : '🚀 PUBLISH ALL CHANGES'}
          </button>
        </div>
      </div>
    </aside>
  );
};