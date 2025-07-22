import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('URL Supabase lub klucz do roli serwisowej nie jest ustawiony w zmiennych');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing id or email' }, { status: 400 });
    }

    // Удаляем из таблицы admins
    const { error: dbError } = await supabase.from('admins').delete().eq('id', id);
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    // Удаляем из Supabase Auth
    const { data, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 });
    }
    const user = data?.users.find((u: { email?: string }) => u.email === email);
    if (user) {
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    let message = 'Server error';
    if (e instanceof Error) message = e.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 