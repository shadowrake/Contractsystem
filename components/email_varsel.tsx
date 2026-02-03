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
}

// This function runs on the server
const UtkastVarselFrom: React.FC<Readonly<ContractFormInputs>> = ({id, input, email, contact, seller, buyer, orgnr, address, phone, total, comment}) => {
  return <div>
      <h1>Du har fått et nytt utkast laget for deg, vennligst sjekk det ut.</h1>
      <a style={{
      color: '#007bff',  // Text color
      textDecoration: 'none',  // Remove underline
      padding: '10px 20px',  // Add padding
      backgroundColor: '#f8f9fa',  // Background color
      border: '1px solid #007bff',  // Border styling
      borderRadius: '5px',  // Rounded corners
      display: 'inline-block',  // Ensure it behaves like a button
      fontWeight: 'bold',  // Bold text
    }} href={`https://hermankristiansen.no/dashboard/draft/`}>
        Gå til dine utkast
      </a>
    </div>
};

export default UtkastVarselFrom;
