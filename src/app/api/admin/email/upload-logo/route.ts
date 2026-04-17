import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { assertSuperadmin } from '@/lib/emailCampaign';

export const runtime = 'nodejs';

const BUCKET = 'email-assets';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const adminEmail = String(form.get('adminEmail') || '');
  if (!(await assertSuperadmin(adminEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }
  const sb = getSupabaseAdmin();
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `logo-${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await sb.storage
    .from(BUCKET)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type || 'image/png',
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json(
      { error: `Storage: ${upErr.message}. Utwórz publiczny bucket "${BUCKET}".` },
      { status: 400 }
    );
  }
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
