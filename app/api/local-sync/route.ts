import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    // セキュリティ: 開発環境以外からのアクセスはブロック
    if (process.env.NODE_ENV !== 'development') {
        return new NextResponse('Forbidden: This endpoint is only available in development mode.', { status: 403 });
    }

    try {
        const body = await req.json();
        const { password, events } = body;

        // パスワードチェック (環境変数)
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Invalid Password' }, { status: 401 });
        }

        // src/data/events.json への書き込みパス
        const dataPath = path.join(process.cwd(), 'src', 'data', 'events.json');

        // JSONを見やすくフォーマットして保存
        await fs.writeFile(dataPath, JSON.stringify(events, null, 2), 'utf8');

        console.log(`[local-sync] Successfully saved ${events.length} events to ${dataPath}`);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[local-sync] Error:', err);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
