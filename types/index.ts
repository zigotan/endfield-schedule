// types/index.ts

export type EventType = 'main' | 'story' | 'event' | 'high_difficulty' | 'gacha' | 'campaign';

export interface GameEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: EventType;
  bannerImage?: string; 
}

export interface WeekMarker {
  percent: number;
  label: string;
}

// これがあることで、確実に「モジュール」として認識させます
export {};