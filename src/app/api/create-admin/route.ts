// app/api/create-admin/route.ts (для App Router)
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Только на сервере
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, role } = body;

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Создаем пользователя в Supabase Auth
  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Добавляем в таблицу admins
  const { error: insertError } = await supabase.from('admins').insert([{ email, role }]);
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
