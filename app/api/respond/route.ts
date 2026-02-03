// Twilio SMS webhook handler (deprecated)
/* import { NextRequest, NextResponse } from 'next/server';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { createClient } from '@supabase/supabase-js';
import GodkjeningFrom from '@/components/email_godkjen';
import AvvisFrom from '@/components/email_avvis';
import { Resend } from 'resend';


const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  const twiml = new MessagingResponse();

  const body = await req.text();
  const params = new URLSearchParams(body);
  const messageBody = params.get('Body')?.toLowerCase();
  const fromNumber = params.get('From')?.trim();
  if (!fromNumber || fromNumber === null) {
    twiml.message('Invalid phone number.');
    return new NextResponse(twiml.toString(), { 
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
  const uuid = await getMostRecentUuidByPhoneNumber(fromNumber);
  const status = await getMostRecentStatusByPhoneNumber(fromNumber);
  const cntNumber = fromNumber.substring(0,3);
  console.log(`Msg ${messageBody}`, ` From ${fromNumber}`, ` UUID ${uuid}`);
  if(status === 'underReview'){
  if (messageBody?.includes('ok') || messageBody?.includes('ja')) {
    twiml.message(`Vilkårene er nå aksptert!`);
    if(uuid){
    await insertData(uuid, 'Godkjent');
    const {data} = await supabase.from('contracts').select().eq('id', uuid).single()
    const contract = data
    try {
      await resend.emails.send({
        from: 'Herman KristiansenKontraktsystem <`test@hermankristiansen.no`>',
        to: [`${contract.email}`],
        bcc: [`${contract.seller_email}` , `test@hermankristiansen.no`],
        subject: `Godkjennelse av kontrakt fra Herman Kristiansen | Selger: ${contract.seller} | Bedrift: ${contract.buyer}`,
        text: `Hei, kontrakten fra ${contract.seller} til ${contract.buyer} med orgnr: ${contract.orgnr} og adresse: ${contract.address} og telefon: ${contract.phone},\nvalgte pakker: ${contract.input} med en total på ${contract.total} kr, ${contract.comment} er godkjent.\n\nMvh\nhermankristiansen`,
        react: GodkjeningFrom({ id: contract.id, email: contract.email, contact: contract.contact, input: contract.input, seller: contract.seller, buyer: contract.buyer, orgnr: contract.orgnr, address: contract.address, phone: contract.phone, total: contract.total, comment: contract.comment, user_email: contract.seller_email, user_phone: contract.seller_phone }),
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
    }
    else {
      console.error('UUID not found in the message body.');
    }
  } else if(messageBody?.includes('nei')){
    twiml.message(`Vilkårene er nå avslått!`);
    if(uuid){
      await insertData(uuid, 'Avvist');
      const {data} = await supabase.from('contracts').select().eq('id', uuid).single()
        const contract = data
        
         try {
          await resend.emails.send({
            from: 'Herman KristiansenKontraktsystem <`test@hermankristiansen.no`>',
            to: [`${contract.email}`],
            bcc: [`${contract.seller_email}`, `test@hermankristiansen.no`],
            subject: `Kontrakt fra Herman Kristiansen Har blitt avvist | Bedrift: ${contract.buyer}`,
            text: `Hei, kontrakten fra ${contract.seller} til ${contract.buyer} med orgnr: ${contract.orgnr} og adresse: ${contract.address} og telefon: ${contract.phone},\nvalgte pakker: ${contract.input} med en total på ${contract.total} kr, ${contract.comment} er godkjent.\n\nMvh\nhermankristiansen`,
            react: AvvisFrom({ id: contract.id, email: contract.email, contact: contract.contact, input: contract.input, seller: contract.seller, buyer: contract.buyer, orgnr: contract.orgnr, address: contract.address, phone: contract.phone, total: contract.total, comment: contract.comment, user_email: contract.seller_email, user_phone: contract.seller_phone }),
          });
        } catch (error) {
          console.error('Error sending email:', error);
        }
    }
  }else {
    twiml.message('Vennligst svar "Ok" for å godkjenne vilkårene.');
  }
} else{
  twiml.message('Kontrakten er signert.');
}

  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

async function getMostRecentUuidByPhoneNumber(phoneNumber: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select('id')
    .eq('phone', phoneNumber)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error retrieving UUID:', error.message);
    return null;
  }

  return data?.id;
}


async function getMostRecentStatusByPhoneNumber(phoneNumber: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select('status')
    .eq('phone', phoneNumber)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error retrieving UUID:', error.message);
    return null;
  }

  return data?.status;
}


async function insertData(id: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .update({ status })
      .eq('id', id);
    if (error) {
      console.error('Error updating data:', error.message);
    } else {
      console.log('Success:', data);
    }
  } catch (error) {
    console.error('An error occurred:', (error as Error).message);
  }
} */

// Supabase + Resend + Sveve (mobile api handler) SMS webhook handler
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import GodkjeningFrom from '@/components/email_godkjen';
import AvvisFrom from '@/components/email_avvis';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

//Sveve outbound
function normalizeMsisdnOutgoing(n: string) {
  const digits = n.replace(/\D/g, '');
  return n.startsWith('+') ? n : `+${digits}`;
}

async function sendViaSveve(to: string, text: string) {
  const url = process.env.SVEVE_BASE_URL || 'https://sveve.no/SMS/SendMessage';
  const body = new URLSearchParams({
    user: process.env.SVEVE_USERNAME as string,
    passwd: process.env.SVEVE_PASSWORD as string,
    from: process.env.SVEVE_FROM as string, 
    to: normalizeMsisdnOutgoing(to),
    msg: text,
    charset: 'UTF-8',
    f: 'json'
  });

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  // We don't throw on failure here—MO must always ACK to Sveve.
  try {
    const ct = r.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await r.json() : await r.text();
    if (!r.ok) console.error('Sveve confirm send failed:', payload);
    else console.log('Sveve confirm send resp:', payload);
  } catch (e) {
    console.error('Sveve confirm parsing error:', e);
  }
}

//Parsing helpers
function firstDefined(obj: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.length) return v;
  }
  return undefined;
}

function normalizeMsisdnIncoming(raw?: string) {
  if (!raw) return undefined;
  let n = raw.trim().replace(/\s+/g, '');
  if (n.startsWith('+')) return n;
  n = n.replace(/[^\d]/g, '');
  if (/^\d{8}$/.test(n)) return `+47${n}`;
  if (n.startsWith('0047')) return `+${n.slice(2)}`;
  if (/^47\d{8}$/.test(n)) return `+${n}`;
  return `+${n}`;
}

async function parseSveveRequest(req: NextRequest) {
  const method = req.method.toUpperCase();
  const url = new URL(req.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (query[k] = v));

  const ct = (req.headers.get('content-type') || '').toLowerCase();
  let bodyParams: Record<string, string> = {};
  if (method === 'POST') {
    try {
      if (ct.includes('application/json')) {
        const j = await req.json();
        for (const [k, v] of Object.entries(j ?? {})) if (v != null) bodyParams[k] = String(v);
      } else {
        const raw = await req.text();
        const form = new URLSearchParams(raw);
        form.forEach((v, k) => (bodyParams[k] = v));
      }
    } catch { /* ignore */ }
  }

  const lowerize = (r: Record<string, string>) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), v]));
  const all = lowerize({ ...query, ...bodyParams });

  const fromRaw = firstDefined(all, ['from', 'sender', 'msisdn', 'number', 'src', 'phone', 'phonenumber']);
  const toRaw   = firstDefined(all, ['to', 'destination', 'dst']);
  const msgRaw  = firstDefined(all, ['msg', 'message', 'text', 'body']);
  const id      = firstDefined(all, ['id', 'msgid', 'reference', 'ref', 'messageid']);
  const time    = firstDefined(all, ['time', 'timestamp', 'receivedat']);

  const from = normalizeMsisdnIncoming(fromRaw);
  const to   = normalizeMsisdnIncoming(toRaw);

  return { from, to, msgRaw, id, time, raw: all };
}

//Supabase helpers
function phoneVariants(e164?: string) {
  if (!e164) return [];
  const e = e164;
  const local8 = e.startsWith('+47') && e.length === 11 ? e.slice(3) : undefined;    
  const noPlus = e.startsWith('+') ? e.slice(1) : undefined;                          
  const with00 = e.startsWith('+') ? `00${e.slice(1)}` : undefined;                   
  return Array.from(new Set([e, local8, noPlus, with00].filter(Boolean))) as string[];
}

async function getMostRecentUuidByAnyPhone(variants: string[]) {
  const { data, error } = await supabase
    .from('contracts')
    .select('id, phone, date')
    .in('phone', variants)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) console.error('UUID lookup error:', error.message);
  return data?.id ?? null;
}

async function getMostRecentStatusByAnyPhone(variants: string[]) {
  const { data, error } = await supabase
    .from('contracts')
    .select('status, phone, date')
    .in('phone', variants)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) console.error('Status lookup error:', error.message);
  return data?.status ?? null;
}

async function updateStatus(id: string, status: string) {
  const { error } = await supabase.from('contracts').update({ status }).eq('id', id);
  if (error) console.error('Supabase update error:', error.message);
}

//Unified handler
async function handleSveveMO(req: NextRequest) {
  try {
    const { from, to, msgRaw, id, raw } = await parseSveveRequest(req);

    if (!from) {
      console.warn('MO missing "from"', { raw });
      return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }

    const messageBody = (msgRaw || '').toLowerCase().trim();
    const variants = phoneVariants(from);
    const [uuid, status] = await Promise.all([
      getMostRecentUuidByAnyPhone(variants),
      getMostRecentStatusByAnyPhone(variants),
    ]);

    // Decide action + confirmation text
    let confirmText: string | null = null;

    if (status === 'underReview') {
      if (messageBody.includes('ok') || messageBody.includes('ja')) {
        if (uuid) {
          await updateStatus(uuid, 'Godkjent');
          const { data: contract } = await supabase.from('contracts').select().eq('id', uuid).single();
          if (contract) {
            // Send emails (same as before)
            try {
              await resend.emails.send({
                from: 'Herman KristiansenKontraktsystem <`test@hermankristiansen.no`>',
                to: [String(contract.email)],
                bcc: [String(contract.seller_email), `test@hermankristiansen.no`],
                subject: `Godkjennelse av kontrakt fra Herman Kristiansen | Selger: ${contract.seller} | Bedrift: ${contract.buyer}`,
                text: `Hei, kontrakten fra ${contract.seller} til ${contract.buyer} er godkjent.`,
                react: GodkjeningFrom({
                  id: contract.id, email: contract.email, contact: contract.contact, input: contract.input,
                  seller: contract.seller, buyer: contract.buyer, orgnr: contract.orgnr, address: contract.address,
                  phone: contract.phone, total: contract.total, comment: contract.comment,
                  user_email: contract.seller_email, user_phone: contract.seller_phone
                }),
              });
            } catch (e) { console.error('Resend email error:', e); }
          }
        }
        confirmText = `Takk! Vilkårene er nå akseptert. Ref: ${uuid ?? id ?? ''}`;
      } else if (messageBody.includes('nei')) {
        if (uuid) {
          await updateStatus(uuid, 'Avvist');
          const { data: contract } = await supabase.from('contracts').select().eq('id', uuid).single();
          if (contract) {
            try {
              await resend.emails.send({
                from: 'Herman KristiansenKontraktsystem <`test@hermankristiansen.no`>',
                to: [String(contract.email)],
                bcc: [String(contract.seller_email), `test@hermankristiansen.no`],
                subject: `Kontrakt fra Herman Kristiansen Har blitt avvist | Bedrift: ${contract.buyer}`,
                text: `Hei, kontrakten fra ${contract.seller} til ${contract.buyer} er avvist.`,
                react: AvvisFrom({
                  id: contract.id, email: contract.email, contact: contract.contact, input: contract.input,
                  seller: contract.seller, buyer: contract.buyer, orgnr: contract.orgnr, address: contract.address,
                  phone: contract.phone, total: contract.total, comment: contract.comment,
                  user_email: contract.seller_email, user_phone: contract.seller_phone
                }),
              });
            } catch (e) { console.error('Resend email error:', e); }
          }
        }
        confirmText = `Vi har registrert avslag på kontrakten. Ref: ${uuid ?? id ?? ''}`;
      } else {
        confirmText = `Ugyldig svar. Svar "Ok" eller "Ja" for å godkjenne, eller "Nei" for å avslå.`;
      }
    } else {
      confirmText = `Dere har alt svart på melding. Ta kontakt ved spørsmål på test@hermankristiansen.no.`;
    }

    // Send confirmation SMS back to the sender (non-blocking for Sveve)
    if (confirmText) {
      sendViaSveve(from, confirmText).catch(e => console.error('Confirm send error:', e));
    }

    // Always ACK to Sveve
    return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (err) {
    console.error('Sveve MO handler error:', err);
    return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
}

export async function GET(req: NextRequest) { return handleSveveMO(req); }
export async function POST(req: NextRequest) { return handleSveveMO(req); }

