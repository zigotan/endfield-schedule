import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    // セキュリティ: 開発環境以外からのアクセスはブロック
    if (process.env.NODE_ENV !== 'development') {
        return new NextResponse('Forbidden: This endpoint is only available in development mode.', { status: 403 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const password = formData.get('password') as string;

        // パスワードチェック (環境変数)
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Invalid Password' }, { status: 401 });
        }

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 一意なファイル名を生成 (タイムスタンプ + ランダムな英数字)
        const ext = path.extname(file.name) || '.png';
        const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;

        // 保存先パス: public/images/
        const uploadDir = path.join(process.cwd(), 'public', 'images');

        // ディレクトリが存在しない場合は作成
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);

        console.log(`[upload] Successfully saved file to ${filePath}`);

        // フロントエンドで使用する設定用のパブリックURLパスを返す
        return NextResponse.json({ success: true, url: `/images/${filename}` });
    } catch (err: any) {
        console.error('[upload] Error:', err);
        return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
    }
}
