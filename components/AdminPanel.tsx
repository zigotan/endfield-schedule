// components/AdminPanel.tsx
import React, { useRef } from 'react';
import { Monitor, ImageIcon, FileDown, FileJson } from 'lucide-react';
import { EventType } from '../types'; // さっき作ったtypesフォルダから読み込みます

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
  inputType: EventType;
  setInputType: (v: EventType) => void;
  inputImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveEntry: () => void;
  isSyncing: boolean;
  handleJsonExport: () => void;
  handleJsonImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isAdmin, setIsAdmin,
  isEditing, setIsEditing,
  inputTitle, setInputTitle,
  inputStart, setInputStart,
  inputEnd, setInputEnd,
  inputType, setInputType,
  inputImage, handleImageUpload,
  handleSaveEntry, isSyncing,
  handleJsonExport, handleJsonImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return null;

  return (
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
        <div className="pt-4 border-t border-zinc-800 mt-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">BACKUP / RESTORE</h2>
          <div className="grid grid-cols-2 gap-2">
             <button onClick={handleJsonExport} className="flex items-center justify-center gap-1 bg-zinc-800 border border-zinc-700 p-2 text-[10px] text-zinc-300 rounded-sm hover:bg-zinc-700 hover:text-white transition-colors">
                <FileDown size={14}/> SAVE FILE
             </button>
             <label className="flex items-center justify-center gap-1 bg-zinc-800 border border-zinc-700 p-2 text-[10px] text-zinc-300 rounded-sm hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer">
                <FileJson size={14}/> LOAD FILE
                <input type="file" onChange={handleJsonImport} className="hidden" accept=".json"/>
             </label>
          </div>
        </div>
      </div>
    </aside>
  );
};