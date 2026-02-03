import React from 'react';
import { createClient } from '@supabase/supabase-js';

interface ContractFormInputs {
  id: string;
  input: Array<{ comment: string; name: string; description: string }>;
  seller: string;
  buyer: string;
  orgnr: string;
  address: string;
  phone: string;
  contact: string;
  email: string;
  total: number;
  comment: string;
  user_email: string | undefined;
  user_phone: string | undefined;
}

async function fetchMostRecentUuidByPhoneNumber(phone: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('contracts')
    .select('id')
    .eq('phone', phone)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error retrieving UUID:', error.message);
    return null;
  }

  return data?.id || null;
}

const ContractForm: React.FC<Readonly<ContractFormInputs & { uuid: string | null }>> = ({
  id,
  input,
  seller,
  buyer,
  orgnr,
  address,
  phone,
  contact,
  email,
  total,
  comment,
  uuid,
  user_email,
  user_phone,
}) => {
  const monthPrice = total / 12;

  const intMonthPrice = Math.round(monthPrice);


  return (
    <div>
      <h1>Kontrakt fra Herman kristiansen</h1>
      <p style={{fontSize: "1.1em", fontWeight: "semibold"}}>
        <h2>Kunde <br /></h2>
        Firmanavn: {buyer} <br />
        Orgnr: {orgnr} <br />
        Addresse: {address} <br />
        Mobil: {phone} <br />
        E-post: {email} <br />
        Kontaktperson: {contact} <br />
      </p>
      <p>
        <h2>Leverandør <br /></h2>
        Firmanavn: Herman kristiansen <br />
        Orgnr:  <br />
        Addresse:<br />
        Mobil: {user_phone} <br />
        Kontaktperson: {seller} <br />
        E-post: {user_email} <br />
      </p>
      <p style={{fontSize: "1.1em", fontWeight: "semibold"}}>
        <h2>Tjeneste/Tjenester</h2>
        {input.map((person) => (
          <div key={person.name}>
            {person.comment !== '' && (
              <div style={{fontSize: "1.1em", fontWeight: "semibold"}}>
                <p>
                  {person.name}: <br />
                </p>
                <p>{person.description}</p>
                <p>Pris: Kr {person.comment},-</p>
              </div>
            )}
          </div>
        ))}
        <p style={{fontSize: "1.1em", fontWeight: "semibold"}}>Total pris: {total} kr eks. MVA</p>
        <p style={{fontSize: "1.1em", fontWeight: "semibold"}}>Kommentar: {comment}</p>
        <br />
      </p>

      <p>For å godkjenne/avvise kontrakten, klikk på lenken under eller svar &quot;Ja&quot; eller &quot;Ok&quot; på denne e-posten.</p>
      <a style={{
      color: '#007bff',  // Text color
      textDecoration: 'none',  // Remove underline
      padding: '10px 20px',  // Add padding
      backgroundColor: '#f8f9fa',  // Background color
      border: '1px solid #007bff',  // Border styling
      borderRadius: '5px',  // Rounded corners
      display: 'inline-block',  // Ensure it behaves like a button
      fontWeight: 'bold',  // Bold text
    }} href={`https://hermankristiansen.no/contractconfirm/underReview/${uuid}`}>
        Gå til godkjening
      </a>
      <a style={{
      color: '#007bff',  // Text color
      textDecoration: 'none',  // Remove underline
      padding: '10px 20px',  // Add padding
      backgroundColor: '#f8f9fa',  // Background color
      border: '1px solid #007bff',  // Border styling
      borderRadius: '5px',  // Rounded corners
      display: 'inline-block',  // Ensure it behaves like a button
      fontWeight: 'bold',  // Bold text
    }} href={`https://hermankristiansen.no/vilkår.pdf`}>
        Gå til vilkår
      </a>
      <p style={{fontSize: '0.8em', color: 'gray', marginTop: '20px'}}>
        Denne e-posten er automatisk generert. Kontakt alltid test@hermankristiansen.no.
      </p>

    </div>
  );
};

// This function runs on the server
export default async function ServerComponentWrapper(props: ContractFormInputs) {
  // Fetch UUID or any other data
  const uuid = await fetchMostRecentUuidByPhoneNumber(props.phone);

  // Pass the fetched data to the ContractForm component
  return <ContractForm {...props} uuid={uuid} />;
}