import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('URL Supabase lub klucz do roli serwisowej nie jest ustawiony w zmiennych');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Missing email or newPassword' }, { status: 400 });
    }

    // Найти пользователя по email
    const { data, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 });
    }
    const user = data?.users.find((u: { email?: string }) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'Nie znaleziono użytkownika w Supabase Auth' }, { status: 404 });
    }

    // Сменить пароль
    const { error: pwdError } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
    if (pwdError) {
      return NextResponse.json({ error: pwdError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    let message = 'Server error';
    if (e instanceof Error) message = e.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 