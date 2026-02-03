"use client";
import React from 'react'
import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from 'react'
import { toast } from "sonner";
import DeleteDraft from "@/components/deleteDraft";
import DownloadPdf from "@/components/pdf_vilkår";


export default function Draft({ contracts }: { contracts: Contract[] }) {
      const [data, setData] = useState<ContractFormInputs>();

      // map the contracts to the form inputs so i use them in default values in useForm
      const contract = contracts[0];
      useEffect(() => {
        if (!contract) return; 
        const mappedInputs = contract.input.map((input) => ({
          id: input.id,
          name: input.name,
          description: input.description,
          comment: input.comment,
        }));
      
        setData({
          id: contract.id,
          seller: contract.seller,
          buyer: contract.buyer,
          orgnr: contract.orgnr,
          contact: contract.contact,
          email: contract.email,
          phone: contract.phone,
          address: contract.address,
          input: mappedInputs,
          total: contract.total,
          comment: contract.comment,
          user_email: contract.seller_email,
          user_phone: contract.seller_phone,
        });
      }, [contract]);
 const {
      register,
      handleSubmit,
      watch,
      control,
      getValues,
      reset,
      formState: { errors, isSubmitting }, setValue
    } = useForm<ContractFormInputs>({
      defaultValues: {
        id: contract.id,
        seller: contract.seller,
        buyer: contract.buyer,
        orgnr: contract.orgnr,
        contact: contract.contact,
        email: contract.email,
        phone: contract.phone,
        address: contract.address,
        input: contract.input,
        total: contract.total,
        comment: contract.comment,
      },
    });
    
    const processForm: SubmitHandler<ContractFormInputs> = async data => {
      console.log(data);
      if(!data.buyer || !data.orgnr || !data.contact || !data.email || !data.phone || !data.address || !data.input || !data.total || !data.seller) {
        toast.error('Ingen felt kan være tomme');
      } else {
      const formData = new FormData();
      try {
        formData.append('seller', getValues("seller"));
        formData.append('buyer', getValues('buyer'));
        formData.append('orgnr', getValues('orgnr'));
        formData.append('contact', getValues('contact'));
        formData.append('email', getValues('email'));
        formData.append('phone', getValues('phone'));
        formData.append('address', getValues('address'));
        formData.append('input', JSON.stringify(getValues('input')));
        formData.append('total', getValues('total').toString());
        formData.append('comment', getValues('comment'));

        // Call the addOrder function with the FormData
        // const addOrderResult = await addOrder_mock(formData);
  
      } catch (error) {
        // Handle any errors that occurred during the FormData processing or addOrder call
        console.error('Error processing form:', error);
        toast.error('An error occurred while processing the form');
      }
    }
    }

    const date = new Date(contract.date);
  return (
    <div>
    {contracts?.map((contract) => (
      <div key={contract.id}>
        <div className="flex flex-col items-center border-b border-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-base font-semibold leading-7 text-white">
          Kontrakt ID: {contract.id}
        </h1>
        {contract.status === "'Utkast'::text" ? (
          <h2>Status: Utkast</h2>
        ) : (
          <h2>Status: {contract.status}</h2>
        )}
        <h2>Seller: {contract.seller}</h2>
        <h2>
          Dato: {date.toDateString()} @{" "}
          {date.toLocaleTimeString("nb-NO", { timeZone: "Europe/Oslo" })}
        </h2>
        <DownloadPdf />
        <div className="border-t mt-8 flex gap-3">
         <DeleteDraft contractId={contract.id} />
        </div>
      </div>


        <form onSubmit={handleSubmit(processForm)} className="mb-12">
          <input type="text" className="hidden" defaultValue={contract.seller}  {...register('seller' )} />
          <input type="text" className="hidden" defaultValue={contract.buyer}  {...register('buyer' )} />
          <input type="number" className="hidden" defaultValue={contract.orgnr} {...register('orgnr')} />
          <input type="text" className="hidden" defaultValue={contract.contact} {...register('contact' )} />
          <input type="tel" className="hidden" defaultValue={contract.phone} {...register('phone' )} />
          <input type="email" className="hidden" defaultValue={contract.email} {...register('email' )} />
          <input type="text" className="hidden" defaultValue={contract.address} {...register('address' )} />
          <input type="number" className="hidden" defaultValue={contract.total} {...register('total' )} />
          <input type="text" className="hidden" defaultValue={contract.comment} {...register('comment')} />
          <input
              type="text"
              className="hidden"
              {...register('input')}
              defaultValue={JSON.stringify(contract.input ?? [])}
            />
          <div className="bg-black px-6 py-16 lg:px-8">
            <div className="mx-auto max-w-3xl text-base leading-7 text-gray-200">
              <div className="mb-8">
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">
                  Bedrift: {contract.buyer}
                </h1>
                <p className="text-md">OrgNr.{contract.orgnr}</p>
                <p className="text-md">Kontaktperson: {contract.contact}</p>
                <p className="mt-6 text-md leading-8">
                  Tlf: {contract.phone} | Epost: {contract.email}
                </p>
                <p className="mt-2 text-md leading-8">Adresse: {contract.address}</p>
                <p className="mt-2 text-md leading-8">
                  Total sum: {contract.total} NOK eks. MVA
                </p>
              </div>

              <div className="border-t">
                <ul role="list" className="mt-2 max-w-xl space-y-2 text-gray-100">
                  <h2 className="text-xl font-semibold leading-6 text-gray-200">
                    Valgte produkter
                  </h2>
                  {contract.input?.map((input) => (
                    <li key={input.id} className="flex gap-x-3">
                      {input.comment !== "" ? (
                        <div className="flex-auto">
                          <p className="text-base font-semibold leading-6 text-gray-200">
                            {input.name}
                          </p>
                          <p className="mt-2 text-base leading-7">{input.description}</p>
                          <p className="mt-2 text-base leading-7">{input.comment}</p>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t">
                <h2 className="mt-8 text-xl font-semibold leading-6 text-gray-200">
                  Kommentar
                </h2>
                <p className="mt-2">{contract.comment}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    ))}
  </div>
  );
}
