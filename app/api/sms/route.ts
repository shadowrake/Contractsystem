
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio/lib/rest/Twilio";
import { createClient } from '@supabase/supabase-js';

// twilio version removed, using Sveve instead
/* const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

type Item = {
  id: number;
  name: string;
  description: string;
  price: number;
  checked: boolean;
  comment: string;
}

export async function POST(req: NextRequest) {
    try {
      const { to} = await req.json();
  
      const uuid = await getMostRecentUuidByPhoneNumber(to);
      const orgnr = await getMostRecentOrgnrByPhoneNumber(to);
      const firma = await getMostRecentFirmaByPhoneNumber(to);
      const kontakt = await getMostRecentkontaktByPhoneNumber(to);
      const message = await client.messages.create({
        body: `Hei, \nDu har fått en kontrakt fra hermankristiansen. \nFirmanavn: ${firma}(${orgnr})\nKontaktperson: ${kontakt}\nFor å se våre vilkår og tjenesten/tjenestene du har kjøpt klikk på linken\nhttps://hermankristiansen.no/produkter/${uuid} \nNettside: https://hermankristiansen.no\n \nAksepterer du vilkårene? \nSvar "Ok" for å godkjenne. \n\nMvh hermankristiansen.no `,
        from: "twillio Nr",
        to,
      });
      
      console.log(`Message sent to ${to}: ${message.sid} from twillio Nr`);
      return NextResponse.json({ sid: message.sid, message: 'Message sent' }, { status: 200 });
    } catch (error) {
      console.error('Error sending SMS:', error);
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
    }
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
  async function getMostRecentOrgnrByPhoneNumber(phoneNumber: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('orgnr')
      .eq('phone', phoneNumber)
      .order('date', { ascending: false })
      .limit(1)
      .single();
  
    if (error) {
      console.error('Error retrieving UUID:', error.message);
      return null;
    }
  
    return data?.orgnr;
  }
  async function getMostRecentFirmaByPhoneNumber(phoneNumber: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('buyer')
      .eq('phone', phoneNumber)
      .order('date', { ascending: false })
      .limit(1)
      .single();
  
    if (error) {
      console.error('Error retrieving UUID:', error.message);
      return null;
    }
  
    return data?.buyer;
  }
  async function getMostRecentkontaktByPhoneNumber(phoneNumber: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('contact')
      .eq('phone', phoneNumber)
      .order('date', { ascending: false })
      .limit(1)
      .single();
  
    if (error) {
      console.error('Error retrieving UUID:', error.message);
      return null;
    }
  
    return data?.contact;
  } */
 
// Sveve SMS API integration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);


async function sendViaSveve(opts: { to: string; text: string }) {
  const url = process.env.SVEVE_BASE_URL || "https://sveve.no/SMS/SendMessage";

  const normalize = (n: string) => (n.startsWith("+") ? n : `+${n.replace(/\D/g, "")}`);

  const body = new URLSearchParams({
    user: process.env.SVEVE_USERNAME as string,
    passwd: process.env.SVEVE_PASSWORD as string,
    from: process.env.SVEVE_FROM as string,    
    to: normalize(opts.to),
    msg: opts.text,
    charset: "UTF-8",
    f: "json", 
    reply: "true",                                    
  });

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const ct = r.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await r.json() : await r.text();

  if (r.ok) {
    if (typeof payload === "string") {
      if (/^OK\b/i.test(payload.trim())) {
        const id = payload.split(":").slice(1).join(":").trim() || null;
        return { ok: true, id, raw: payload };
      }
    } else if (payload?.result?.toUpperCase?.() === "OK") {
      return { ok: true, id: payload?.msgid ?? payload?.id ?? null, raw: payload };
    }
  }

  throw new Error(`Sveve send failed: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
}

async function getMostRecentUuidByPhoneNumber(phoneNumber: string) {
  const { data, error } = await supabase
    .from("contracts")
    .select("id")
    .eq("phone", phoneNumber)
    .order("date", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    console.error("Error retrieving UUID:", error.message);
    return null;
  }
  return (data?.id as string) ?? null;
}

async function getMostRecentOrgnrByPhoneNumber(phoneNumber: string) {
  const { data, error } = await supabase
    .from("contracts")
    .select("orgnr")
    .eq("phone", phoneNumber)
    .order("date", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    console.error("Error retrieving orgnr:", error.message);
    return null;
  }
  return (data?.orgnr as string) ?? null;
}

async function getMostRecentFirmaByPhoneNumber(phoneNumber: string) {
  const { data, error } = await supabase
    .from("contracts")
    .select("buyer")
    .eq("phone", phoneNumber)
    .order("date", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    console.error("Error retrieving firma:", error.message);
    return null;
  }
  return (data?.buyer as string) ?? null;
}

async function getMostRecentkontaktByPhoneNumber(phoneNumber: string) {
  const { data, error } = await supabase
    .from("contracts")
    .select("contact")
    .eq("phone", phoneNumber)
    .order("date", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    console.error("Error retrieving kontakt:", error.message);
    return null;
  }
  return (data?.contact as string) ?? null;
}

//API handler
export async function POST(req: NextRequest) {
  try {
    const { to } = (await req.json()) as { to: string };

    const [uuid, orgnr, firma, kontakt] = await Promise.all([
      getMostRecentUuidByPhoneNumber(to),
      getMostRecentOrgnrByPhoneNumber(to),
      getMostRecentFirmaByPhoneNumber(to),
      getMostRecentkontaktByPhoneNumber(to),
    ]);

    const text =
      `Hei,\n` +
      `Du har fått en kontrakt fra hermankristiansen.\n` +
      `Firmanavn: ${firma ?? ""}(${orgnr ?? ""})\n` +
      `Kontaktperson: ${kontakt ?? ""}\n` +
      `For å se våre vilkår og tjenesten/tjenestene du har kjøpt klikk på linken\n` +
      `https://hermankristiansen.no/produkter/${uuid ?? ""}\n` +
      `Nettside: https://hermankristiansen.no\n\n` +
      `Aksepterer du vilkårene?\n` +
      `Svar "Ok" for å godkjenne.\n\n` +
      `Mvh hermankristiansen.no`;

    const resp = await sendViaSveve({ to, text });

    return NextResponse.json(
      { id: resp.id, status: "Sent", raw: resp.raw },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending SMS via Sveve:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}

  