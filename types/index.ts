// src/types/index.ts

export type EventType = 'main' | 'story' | 'event' | 'high_difficulty' | 'gacha' | 'campaign';

export interface GameEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: EventType;
  bannerImage?: string;
  description?: string; // ★追加: 詳細説明
}

export interface WeekMarker {
  percent: number;
  label: string;
}

export {};