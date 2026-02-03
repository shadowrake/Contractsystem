// app/api/inbound/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import GodkjeningFrom from '@/components/email_godkjen';
import AvvisFrom from '@/components/email_avvis';

const resend = new Resend(process.env.RESEND_API_KEY!);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
 // Parse inbound e‑mail and extract headers
  const ctype = request.headers.get('content-type') || '';
  if (!ctype.startsWith('multipart/form-data')) {
    return NextResponse.json({ ok: false, reason: 'expect multipart' }, { status: 415 });
  }
  const form = await request.formData();
  console.log('STEP A: got formData');    
  const headers: Record<string, string> = {};

// 1) Mailgun: JSON array field
if (form.has('message-headers')) {
  try {
    const arr = JSON.parse(form.get('message-headers') as string) as [string, string][];
    arr.forEach(([n, v]) => (headers[n.toLowerCase()] = v));
  } catch (e) {
    console.warn('Mailgun header JSON malformed', e);
  }
}

// 2) SendGrid: raw header block in “headers”
if (form.has('headers')) {
  const raw = form.get('headers') as string;
  raw
    .split(/\r?\n/)
    .filter(Boolean)
    .forEach((line) => {
      const i = line.indexOf(':');
      if (i > -1) headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
    });
}

// 3) Fallback: individual fields prefixed with “h:”
['in-reply-to', 'references'].forEach((h) => {
  const v = form.get(`h:${h}`) as string | null;
  if (v) headers[h] = v;
});
console.log('STEP A.1 keys', Object.keys(headers));  
  const subject = form.get('subject') as string | null || '';
  const fromEmail = form.get('from') as string | null || '';
  
  console.log('Subject:', subject);
  console.log('From:', fromEmail);
  
  //Find the contract using multiple methods
  let contractId = null;
  
  const idMatch = subject.match(/Kontrakt #(\d+)/i) || subject.match(/#(\d+)/i);
  if (idMatch && idMatch[1]) {
    contractId = parseInt(idMatch[1], 10);
    console.log('Found contract ID in subject:', contractId);
  } 

  if (!contractId) {
    const detailsMatch = subject.match(/Selger: (.*?) \| Bedrift: (.*?)(?:\||$)/i);
    if (detailsMatch) {
      const seller = detailsMatch[1].trim();
      const buyer = detailsMatch[2].trim();
      console.log('Extracted seller and buyer:', seller, buyer);
      
      const { data: matchedContract } = await supabase
        .from('contracts')
        .select('id')
        .eq('seller', seller)
        .eq('buyer', buyer)
        .eq('status', 'UnderReview')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (matchedContract) {
        contractId = matchedContract.id;
        console.log('Found via seller-buyer match:', contractId);
      }
    }
  }
  if (!contractId && fromEmail) {
    const emailMatch = fromEmail.match(/<([^>]+)>/) || [null, fromEmail];
    const senderEmail = emailMatch[1];
    
    console.log('Looking for contracts with email:', senderEmail);
    
    const { data: matchedByEmail } = await supabase
      .from('sent_contracts')
      .select('contract_id')
      .eq('to', senderEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (matchedByEmail?.contract_id) {
      contractId = matchedByEmail.contract_id;
      console.log('Found via sender email match:', contractId);
    }
  }
  

  if (!contractId) {
    console.log('Inbound mail not recognised');
    return NextResponse.json({ ok: true });
  }

//Load the contract row from Supabase

  const { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single();

  if (!contract) {
    console.error('contract row not found for', contractId);
    return NextResponse.json({ ok: false });
  }

  //Decide action based on first word "ja" / "nei", case‑insensitive
  const bodyText =
    (form.get('stripped-text') as string | null) ?? // Mailgun
    (form.get('text') as string | null) ??          // SendGrid
    '';

    const affirmativePatterns = [
      /\bok\b/i,
      /\bja\b/i,                
      /\bgodkjent\b/i,         
      /\bgodkjenner\b/i,        
      /\bgodtar\b/i,            
      /\bakseptr?erer\b/i,     
      /\bje?g godkjenner\b/i,   
      /\bje?g godtar\b/i,       
    ];
    
    const negativePatterns = [
      /\bnei\b/i,               
      /\bavvis\b/i,             
      /\bavviser\b/i,          
      /\bikke godkjent\b/i,     
      /\bavsl[åa]r\b/i,         
      /\bje?g avviser\b/i,      
      /\bje?g godkjenner ikke\b/i, 
    ];
    
    const hasAffirmative = affirmativePatterns.some(pattern => pattern.test(bodyText));
    const hasNegative = negativePatterns.some(pattern => pattern.test(bodyText));
    
    console.log('Contains affirmative response:', hasAffirmative);
    console.log('Contains negative response:', hasNegative);
    
    if (hasAffirmative && hasNegative) {
      console.log('Both affirmative and negative responses detected. Cannot determine intent.');
      return NextResponse.json({ ok: true });
    }
    
    if ((hasAffirmative || hasNegative) && contract.status === 'underReview') {
      console.log('STEP D: firstWord', hasAffirmative || hasNegative); 
      const newStatus = hasAffirmative ? 'Godkjent' : 'Avvist';
      console.log('Setting status to:', newStatus);

    const { data: updated, error } = await supabase
      .from('contracts')
      .update({ status: newStatus })
      .eq('id', contract.id)
      .eq('status', 'underReview')
      .select('id')
      .maybeSingle();

    if (!updated || error) {
      console.log('Decision already recorded; ignoring duplicate');
      return NextResponse.json({ ok: true });
    }

    //Send notification e‑mail
    await resend.emails.send({
      from: 'Herman Kristiansen Kontraktsystem <test@hermankristiansen.no>',
      to: [contract.email],
      bcc: [
        contract.seller_email ,
        'test@hermankristiansen.no',
      ],
      subject:
        newStatus === 'Godkjent'
          ? `Godkjennelse av kontrakt fra Herman Kristiansen | Selger: ${contract.seller} | Bedrift: ${contract.buyer}`
          : `Kontrakt fra Herman Kristiansen har blitt avvist | Bedrift: ${contract.buyer}`,
      react:
        newStatus === 'Godkjent'
          ? GodkjeningFrom({
              ...contract,
              user_email: contract.seller_email,
              user_phone: contract.seller_phone,
            })
          : AvvisFrom({
              ...contract,
              user_email: contract.seller_email,
              user_phone: contract.seller_phone,
            }),
    });

    console.log(`Kontrakt ${contract.id} markert ${newStatus}`);
  } else {
    console.log('Either not ja/nei, or decision already locked.');
  }

  return NextResponse.json({ ok: true });
}
