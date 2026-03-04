import fs from 'fs/promises';
import path from 'path';
import { GameEvent } from '../../types';

/**
 * Parses events.json and returns an array of GameEvent.
 * This is meant to be run exclusively on the server (Server Components, API routes).
 */
export async function getEvents(): Promise<GameEvent[]> {
    try {
        const dataPath = path.join(process.cwd(), 'src', 'data', 'events.json');
        const fileContents = await fs.readFile(dataPath, 'utf8');
        const events: GameEvent[] = JSON.parse(fileContents);
        return events;
    } catch (error) {
        console.error('Failed to read events.json:', error);
        // Return a default fallback event if the file is missing or corrupted
        return [
            {
                id: 'fallback-1',
                title: 'Error loading schedule',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // +7 days
                type: 'main',
                description: 'Failed to load master schedule from src/data/events.json.',
            },
        ];
    }
}
