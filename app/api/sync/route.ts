import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, events } = body;

    // ★追加: ターミナルに状況を表示させる
    console.log("--- DEBUG START ---");
    console.log("入力されたパスワード:", password);
    console.log("設定ファイルのパスワード:", process.env.ADMIN_PASSWORD);
    console.log("ServiceRoleKeyはあるか:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // 1. パスワードチェック
    if (password !== process.env.ADMIN_PASSWORD) {
      console.log("❌ パスワード不一致エラー");
      return NextResponse.json({ error: 'Invalid Password' }, { status: 401 });
    }

    // 2. 特権キーでSupabaseに接続
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. データを書き込み
    const { error } = await supabaseAdmin
      .from('game_events')
      .upsert({ id: 'master_schedule', data: events, updated_at: new Date() });

    if (error) {
      console.log("❌ Supabase書き込みエラー:", error.message);
      throw error;
    }

    console.log("✅ 書き込み成功！");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ サーバー内部エラー:", err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}