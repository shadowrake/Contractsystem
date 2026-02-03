"use server";

import {z} from "zod"
import {Resend} from "resend"
import {ContractSchema} from "../utils/schema/schema"
import { createClient } from "@/utils/supabase/server"
import { v4 as uuidv4 } from 'uuid';
import ContractForm from "../components/email_contract"
import GodkjeningFrom from "@/components/email_godkjen";
import AvvisFrom from "@/components/email_avvis";
import SlettFrom from "@/components/email_slett";
import PurringFrom from "@/components/email_purring";
import UtkastVarselFrom from "@/components/email_varsel";
import { ContractSchemaUtkast } from "@/utils/schema/schema_utkast";
import ContractForm_eks from "../components/email_contract_eks"


type ContractFormInputs = z.infer<typeof ContractSchema>
type ContractFormInputsUtkast = z.infer<typeof ContractSchemaUtkast>
type AttachmentInput = {
  filename: string;
  base64: string;   
  contentType?: string;
} | null;
const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient()

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
  

export const sendContract = async (data: ContractFormInputs) => {
    
    const { data: {user}, error } = await supabase.auth.getUser()
    const result = ContractSchema.safeParse(data)

    const { data: users } = await supabase.from('profiles').select().eq('id', user?.id).single()

    if (result.success) {
        const {id, input, seller, buyer, orgnr, address, phone, contact, email, total, comment} = result.data
        const uuid = await getMostRecentUuidByPhoneNumber(phone)
        console.log("Sending contract", seller)
        try {
            const data = await resend.emails.send({
                from: 'Herman kristiansen Kontraktsystem <kontrakt@hermankristiansen.no>',
                to: [`${email}`],
                bcc: [`${user?.email}` , `test@hermankristiansen.no`],
                subject: `Kontrakt fra Herman Kristiansen | Selger: ${seller} | Bedrift: ${buyer} | Ordre: ${uuid}`,
                text: `Hei ${contact}, her er kontrakten fra ${seller} til ${buyer} med orgnr: ${orgnr} og adresse: ${address} og telefon: ${phone},\nvalgte pakker: ${input} med en total på ${total} kr, ${comment} \n\nMvh\nherman kristiansen`,
                react: ContractForm({id, email, contact, input, seller, buyer, orgnr, address, phone, total, comment, user_email: users?.user_email, user_phone: users?.user_phone}), 
            })
            return {success: true, data: data}
        }
        catch (error) {
            return {success: false, error: error};
        }
        } 
        if (result.error) {
            return {success: false, error: result.error.format()}
        }
}

export const sendGodkjennelse = async (id: string) => {
    const supabase = createClient()
    const {data} = await supabase.from('contracts').select().eq('id', id).single()
    const contract = data
    
        try {
            const data = await resend.emails.send({
                from: 'Herman kristiansen Kontraktsystem <kontrakt@hermankristiansen.no>',
                to: [`${contract.email}`],
                bcc: [`${contract.seller_email}`, `test@hermankristiansen.no`],
                subject: `Godkjennelse av kontrakt fra Herman Kristiansen | Selger: ${contract.seller} | Bedrift: ${contract.buyer}`,
                text: `Hei, kontrakten fra ${contract.seller} til ${contract.buyer} med orgnr: ${contract.orgnr} og adresse: ${contract.address} og telefon: ${contract.phone},\nvalgte pakker: ${contract.input} med en total på ${contract.total} kr, ${contract.comment} er godkjent.\n\nMvh\nherman kristiansen`,
                react: GodkjeningFrom({id: contract.id, email: contract.email, contact: contract.contact, input: contract.input, seller: contract.seller, buyer: contract.buyer, orgnr: contract.orgnr, address: contract.address, phone: contract.phone, total: contract.total, comment: contract.comment, user_email: contract.seller_email, user_phone: contract.seller_phone})
            })
            return {success: true, data: data}
        }
        catch (error) {
            return {success: false, error: error};
        }
    }
 export const sendAvvis = async (id: string) => {
        const supabase = createClient()
        const {data} = await supabase.from('contracts').select().eq('id', id).single()
        const contract = data
        
            try {
                const data = await resend.emails.send({
                    from: 'Herman kristiansen Kontraktsystem <kontrakt@hermankristiansen.no>',
                    to: [`${contract.email}`],
                    bcc: [`${contract.seller_email}`, `test@hermankristiansen.no`],
                    subject: `Avvisning av kontrakt fra Herman Kristiansen | Bedrift: ${contract.buyer}`,
                    text: `Hei, kontrakten fra ${contract.seller} til ${contract.buyer} med orgnr: ${contract.orgnr} og adresse: ${contract.address} og telefon: ${contract.phone},\nvalgte pakker: ${contract.input} med en total på ${contract.total} kr, ${contract.comment} er avvist.\n\nMvh\nherman kristiansen`,
                    react: AvvisFrom({id: contract.id, email: contract.email, contact: contract.contact, input: contract.input, seller: contract.seller, buyer: contract.buyer, orgnr: contract.orgnr, address: contract.address, phone: contract.phone, total: contract.total, comment: contract.comment, user_email: contract.seller_email, user_phone: contract.seller_phone})
                })
                return {success: true, data: data}
            }
            catch (error) {
                return {success: false, error: error};
            }
        }
        export const sendSlett = async (id: string) => {
            const supabase = createClient()
            const {data} = await supabase.from('contracts').select().eq('id', id).single()
            const contract = data
            
                try {
                    const data = await resend.emails.send({
                        from: '[SLETTET] Herman kristiansen Kontraktsystem <kontrakt@hermankristiansen.no>',
                        to: [`${contract.email}`],
                        bcc: [`${contract.seller_email}` , `test@hermankristiansen.no`],
                        subject: `Kontrakt fra Herman Kristiansen   Har blitt slettet | Bedrift: ${contract.buyer}`,
                        text: `Hei, kontrakten fra ${contract.seller} til ${contract.buyer} med orgnr: ${contract.orgnr} og adresse: ${contract.address} og telefon: ${contract.phone},\nvalgte pakker: ${contract.input} med en total på ${contract.total} kr, ${contract.comment} er slettet.\n\nMvh\nherman kristiansen`,
                        react: SlettFrom({id: contract.id, email: contract.email, contact: contract.contact, input: contract.input, seller: contract.seller, buyer: contract.buyer, orgnr: contract.orgnr, address: contract.address, phone: contract.phone, total: contract.total, comment: contract.comment, user_email: contract.seller_email, user_phone: contract.seller_phone})
                    })
                    return {success: true, data: data}
                }
                catch (error) {
                    return {success: false, error: error};
                }
            }
export const sendPurring = async (id: string) => {
    const supabase = createClient()
    const {data} = await supabase.from('contracts').select().eq('id', id).single()
    const contract = data
                
    try {
        const data = await resend.emails.send({
        from: '[PÅMINNELSE] Herman kristiansen Kontraktsystem <kontrakt@hermankristiansen.no>',
        to: [`${contract.email}`],
        bcc: [`${contract.seller_email}`, `test@hermankristiansen.no`],
        subject: `Påminnelse på kontrakt fra Herman Kristiansen | Selger: ${contract.seller} | Bedrift: ${contract.buyer}`,
        text: `Hei, kontrakten fra ${contract.seller} til ${contract.buyer} med orgnr: ${contract.orgnr} og adresse: ${contract.address} og telefon: ${contract.phone},\nvalgte pakker: ${contract.input} med en total på ${contract.total} kr, ${contract.comment}.\n\nMvh\nherman kristiansen`,
        react: PurringFrom({id: contract.id, email: contract.email, contact: contract.contact, input: contract.input, seller: contract.seller, buyer: contract.buyer, orgnr: contract.orgnr, address: contract.address, phone: contract.phone, total: contract.total, comment: contract.comment, user_email: contract.seller_email, user_phone: contract.seller_phone})
    })
        return {success: true, data: data}
    }
    catch (error) {
        return {success: false, error: error};
    }
}

export const sendUtkastVarsel = async (data: ContractFormInputsUtkast) => {
    const supabase = createClient()
    const { data: {user}, error } = await supabase.auth.getUser()
    const result = ContractSchemaUtkast.safeParse(data)

    const { data: users } = await supabase.from('profiles').select().eq('id', data.user_id).single()

    if (result.success) {
        const {id, input, seller, buyer, orgnr, address, phone, contact, email, total, comment} = result.data
        try {
            const data = await resend.emails.send({
                from: 'Herman Kristiansen Kontraktsystem <kontrakt@hermankristiansen.no>',
                to: [`${users?.user_email}`],
                subject: `Du har fått et nytt utkast `,
                text: `Hei, et nytt utkast er laget for deg, vennligst sjekk det ut.\n\nMvh\nherman kristiansen`,
                react: UtkastVarselFrom({id, email, contact, input, seller, buyer, orgnr, address, phone, total, comment})
            })
            return {success: true, data: data}
        }
        catch (error) {
            return {success: false, error: error};
        }
        } 
        if (result.error) {
            return {success: false, error: result.error.format()}
        }
}

export const sendContract_pre = async (data: ContractFormInputs) => {
    const supabase = createClient()
    const { data: {user}, error } = await supabase.auth.getUser()
    const result = ContractSchema.safeParse(data)
    const { data: users } = await supabase.from('profiles').select().eq('id', user?.id).single()

    if (result.success) {
        const {id, input, seller, buyer, orgnr, address, phone, contact, email, total, comment} = result.data
        const messageId = `${uuidv4()}@hermankristiansen.no`;
        const uuid = await getMostRecentUuidByPhoneNumber(phone)
        console.log("Sending contract", seller)
        try {
            const { data: sendData } = await resend.emails.send({
                from: 'Herman Kristiansen Kontraktsystem <kontrakt@hermankristiansen.no>',
                to: [`${email}`],
                bcc: [`${user?.email}`, `test@hermankristiansen.no`],
                subject: `Kontrakt fra Herman Kristiansen | Selger: ${seller} | Bedrift: ${buyer}`,
                text: `Hei ${contact}, her er kontrakten fra ${seller} til ${buyer} med orgnr: ${orgnr} og adresse: ${address} og telefon: ${phone},\nvalgte pakker: ${input} med en total på ${total} kr, ${comment} \n\nMvh\nherman kristiansen`,
                react: ContractForm({id, email, contact, input, seller, buyer, orgnr, address, phone, total, comment, user_email: users?.user_email, user_phone: users?.user_phone})
            })

            await supabase.from('sent_contracts').insert({
                resend_id: sendData?.id,
                message_id: messageId,
                contract_id: uuid,
                to: email,
              });
            return {success: true, data: data}
        }
        catch (error) {
            return {success: false, error: error};
        }
        } 
        if (result.error) {
            return {success: false, error: result.error.format()}
        }
}

function normalizeRHFInput(input: unknown) {
  if (Array.isArray(input)) {
    return input.filter((row: any) => row?.name && row?.description);
  }

  if (input && typeof input === 'object') {
    return Object.keys(input as Record<string, any>)
      .filter((k) => /^\d+$/.test(k))      
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => (input as any)[k])
      .filter((row: any) => row?.name && row?.description)
      .map((row: any) => ({
        name: String(row.name),
        description: String(row.description),
        comment: String(row?.comment ?? ''),
      }));
  }
  return [];
}

export async function sendContractWithUpload(
  data: ContractFormInputs,
  attachment: AttachmentInput = null
) {
  console.log('sendContractWithUpload called with data:', JSON.stringify(data, null, 2));
  console.log('Attachment info:', attachment ? { filename: attachment.filename, size: attachment.base64?.length } : 'none');

  try {
    const normalized = {
      ...data,
      input: normalizeRHFInput((data as any).input),
      total: typeof data.total === 'string' ? Number(data.total) : data.total,
    };
    console.log('Normalized data:', JSON.stringify(normalized, null, 2));
    const parsed = ContractSchema.safeParse(normalized);
    if (!parsed.success) {
      console.error('Zod validation failed (normalized):', parsed.error.format());
      return { success: false, error: parsed.error.format() };
    }
    const {
      id, input, seller, buyer, orgnr, address, phone, contact, email, total, comment,
    } = parsed.data;

    const { data: authRes, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.warn('supabase.auth.getUser error:', authErr);
      return { success: false, error: authErr };
    }
    const userId = authRes?.user?.id;
    const userEmail = authRes?.user?.email;

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId ?? '')
      .single();
    
    if (profileErr) {
      console.warn('supabase profiles fetch error:', profileErr);
    }

    const attachments: Array<{
      content?: string;
      filename: string;
    }> = [];

    if (attachment?.base64) {
      const buf = Buffer.from(attachment.base64, 'base64');
      if (buf.byteLength > 10 * 1024 * 1024) {
        console.error('Attachment too large:', buf.byteLength);
        return { success: false, error: { message: 'Vedlegg er for stort (maks 10 MB).' } };
      }
      attachments.push({
        content: attachment.base64,
        filename: attachment.filename || 'vedlegg.pdf',
      });
    }

    const termsUrl = 'https://hermankristiansen.no/vilkår.pdf';
    console.log('Fetching terms PDF from:', termsUrl);
    
    try {
      const termsResponse = await fetch(termsUrl);
      if (termsResponse.ok) {
        const termsBuffer = await termsResponse.arrayBuffer();
        const termsBase64 = Buffer.from(termsBuffer).toString('base64');
        attachments.push({
          content: termsBase64,
          filename: 'Generelle_vilkar.pdf',
        });
      } else {
        console.warn('Could not fetch terms PDF, status:', termsResponse.status);
      }
    } catch (fetchError) {
      console.warn('Error fetching terms PDF:', fetchError);
    }

    console.log('Attachments prepared:', attachments.length);

    const messageId = `${uuidv4()}@hermankristiansen.no`;
    const uuid = await getMostRecentUuidByPhoneNumber(phone);

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: 'Herman Kristiansen Kontraktsystem <kontrakt@hermankristiansen.no>',
      to: [email],
      bcc: [userEmail, `test@hermankristiansen.no`].filter(Boolean) as string[],
      subject: `Kontrakt fra Herman Kristiansen   | Selger: ${seller} | Bedrift: ${buyer} | Ordre: ${uuid}`,
      text: `Hei ${contact}, her er kontrakten fra ${seller} til ${buyer} (orgnr ${orgnr}). Valgte pakker: ${
        input.map(i => i.name).join(', ')
      }. Total: ${total} kr.${comment ? `\n\nKommentar: ${comment}` : ''}\n\nMvh\nherman kristiansen`,
      react: ContractForm_eks({
        id, email, contact, input, seller, buyer, orgnr, address, phone, total, comment,
        user_email: profile?.email ?? profile?.user_email,
        user_phone: profile?.phone ?? profile?.user_phone,
      }),
      headers: {
        'Message-ID': `<${messageId}>`,
        'Thread-Topic': `Kontrakt #${uuid}`,
      },
      attachments,
    });

    if (sendError) {
      console.error('Resend send error:', JSON.stringify(sendError, null, 2));
      return { success: false, error: sendError };
    }

    const { error: insertErr } = await supabase.from('sent_contracts').insert({
      resend_id: sendData?.id,
      message_id: messageId,
      contract_id: uuid,
      to: email,
    });
    if (insertErr) console.warn('sent_contracts insert failed:', insertErr);

    return { success: true, data: sendData };
  } catch (error) {
    console.error('sendContractWithUpload exception:', error);
    return { success: false, error };
  }
}

export async function sendContractFiber(
  data: ContractFormInputs,
  attachment: AttachmentInput = null
) {
  console.log('sendContractFiber called with data:', JSON.stringify(data, null, 2));
  console.log('Attachment info:', attachment ? { filename: attachment.filename, size: attachment.base64?.length } : 'none');

  try {
    const normalized = {
      ...data,
      input: normalizeRHFInput((data as any).input),
      total: typeof data.total === 'string' ? Number(data.total) : data.total,
    };
    console.log('Normalized data:', JSON.stringify(normalized, null, 2));
    const parsed = ContractSchema.safeParse(normalized);
    if (!parsed.success) {
      console.error('Zod validation failed (normalized):', parsed.error.format());
      return { success: false, error: parsed.error.format() };
    }
    const {
      id, input, seller, buyer, orgnr, address, phone, contact, email, total, comment,
    } = parsed.data;

    const { data: authRes, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.warn('supabase.auth.getUser error:', authErr);
      return { success: false, error: authErr };
    }
    const userId = authRes?.user?.id;
    const userEmail = authRes?.user?.email;

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId ?? '')
      .single();
    
    if (profileErr) {
      console.warn('supabase profiles fetch error:', profileErr);
    }

    const attachments: Array<{
      content?: string;
      filename: string;
    }> = [];

    if (attachment?.base64) {
      const buf = Buffer.from(attachment.base64, 'base64');
      if (buf.byteLength > 10 * 1024 * 1024) {
        console.error('Attachment too large:', buf.byteLength);
        return { success: false, error: { message: 'Vedlegg er for stort (maks 10 MB).' } };
      }
      attachments.push({
        content: attachment.base64,
        filename: attachment.filename || 'vedlegg.pdf',
      });
    }

    const termsUrl = 'https://hermankristiansen.no/vilkår.pdf';
    console.log('Fetching terms PDF from:', termsUrl);
    
    try {
      const termsResponse = await fetch(termsUrl);
      if (termsResponse.ok) {
        const termsBuffer = await termsResponse.arrayBuffer();
        const termsBase64 = Buffer.from(termsBuffer).toString('base64');
        attachments.push({
          content: termsBase64,
          filename: 'Generelle_vilkar.pdf',
        });
      } else {
        console.warn('Could not fetch terms PDF, status:', termsResponse.status);
      }
    } catch (fetchError) {
      console.warn('Error fetching terms PDF:', fetchError);
    }

    console.log('Attachments prepared:', attachments.length);

    const messageId = `${uuidv4()}@hermankristiansen.no`;
    const uuid = await getMostRecentUuidByPhoneNumber(phone);

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: 'Herman Kristiansen Kontraktsystem <kontrakt@hermankristiansen.no>',
      to: [email],
      bcc: [userEmail, `test@hermankristiansen.no`].filter(Boolean) as string[],
      subject: `Kontrakt fra Herman Kristiansen  | Selger: ${seller} | Bedrift: ${buyer} | Ordre: ${uuid}`,
      text: `Hei ${contact}, her er kontrakten fra ${seller} til ${buyer} (orgnr ${orgnr}). Valgte pakker: ${
        input.map(i => i.name).join(', ')
      }. Total: ${total} kr.${comment ? `\n\nKommentar: ${comment}` : ''}\n\nMvh\nherman kristiansen`,
      react: ContractForm_eks({
        id, email, contact, input, seller, buyer, orgnr, address, phone, total, comment,
        user_email: profile?.email ?? profile?.user_email,
        user_phone: profile?.phone ?? profile?.user_phone,
      }),
      headers: {
        'Message-ID': `<${messageId}>`,
        'Thread-Topic': `Kontrakt #${uuid}`,
      },
      attachments,
    });

    if (sendError) {
      console.error('Resend send error:', JSON.stringify(sendError, null, 2));
      return { success: false, error: sendError };
    }

    const { error: insertErr } = await supabase.from('sent_contracts').insert({
      resend_id: sendData?.id,
      message_id: messageId,
      contract_id: uuid,
      to: email,
    });
    if (insertErr) console.warn('sent_contracts insert failed:', insertErr);

    return { success: true, data: sendData };
  } catch (error) {
    console.error('sendContractWithUpload exception:', error);
    return { success: false, error };
  }
}
