import React from 'react';

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

// This function runs on the server
const AvvisFrom: React.FC<Readonly<ContractFormInputs>> = ({input, email, contact, seller, buyer, orgnr, address, phone, total, comment, id, user_email, user_phone}) => {
    const monthPrice = total / 12;
    const intMonthPrice = Math.round(monthPrice);
  return <div>
      <h1>Kontrakten fra Herman kristiansen har blitt avslått</h1>
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
        Orgnr:<br />
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
      <p>For å gi en Tilbakemeldig, klikk på lenken under.</p>
      <a style={{
      color: '#007bff',  // Text color
      textDecoration: 'none',  // Remove underline
      padding: '10px 20px',  // Add padding
      backgroundColor: '#f8f9fa',  // Background color
      border: '1px solid #007bff',  // Border styling
      borderRadius: '5px',  // Rounded corners
      display: 'inline-block',  // Ensure it behaves like a button
      fontWeight: 'bold',  // Bold text
    }} href={`https://hermankristiansen.no/contractconfirm/denied/${id}`}>
        Gi Tilbakemeldig
      </a>
      <p style={{fontSize: "0.8em", color: "gray", marginTop: "20px"}}>
        Denne e-posten er automatisk generert. Vennligst ikke svar på denne e-posten. Kontakt alltid test@hermankristiansen.no.
      </p>
    </div>
};

export default AvvisFrom;
