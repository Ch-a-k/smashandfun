import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { assertSuperadmin } from '@/lib/emailCampaign';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const adminEmail = req.nextUrl.searchParams.get('adminEmail');
  if (!(await assertSuperadmin(adminEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const sb = getSupabaseAdmin();
  const { data } = await sb.from('email_brand').select('*').eq('id', 1).maybeSingle();
  return NextResponse.json({ brand: data });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!(await assertSuperadmin(body.adminEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const sb = getSupabaseAdmin();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.logo_url === 'string') patch.logo_url = body.logo_url;
  if (typeof body.primary_color === 'string') patch.primary_color = body.primary_color;
  if (typeof body.sender_name === 'string') patch.sender_name = body.sender_name;
  const { data, error } = await sb
    .from('email_brand')
    .update(patch)
    .eq('id', 1)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ brand: data });
}
