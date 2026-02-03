"use client";
import React from 'react'
import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from 'react'
import { toast } from "sonner";
import DeleteDraft from "@/components/deleteDraft";
import { deleteDraft } from "@/app/serverActions/deleteDraft";
import DownloadPdf from "@/components/pdf_vilkår";
import { addOrder } from "@/app/serverActions/addOrder";
import { sendContract_pre } from "@/app/actions";
import { Field, Label, Switch } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Draft({ contracts }: { contracts: Contract[] }) {
      const [agreed, setAgreed] = useState(false);
      const [data, setData] = useState<ContractFormInputs>();
      const [totalPrice, setTotalPrice] = useState(0);
      const [prefix, setPrefix] = useState('+47');

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
        user_email: contract.seller_email,
        user_phone: contract.seller_phone,
      },
    });
    
    const processForm: SubmitHandler<ContractFormInputs> = async data => {
      console.log(data);
      if(!data.buyer || !data.orgnr || !data.contact || !data.email || !data.phone || !data.address || !data.input || !data.total || !data.seller || !data.comment || !data.user_email || !data.user_phone) {
        toast.error('Ingen felt kan være tomme');
      }else {
      const formData = new FormData();
       try {
        // Append form data
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
        const addOrderResult = await addOrder(formData);
  
      } catch (error) {
        // Handle any errors that occurred during the FormData processing or addOrder call
        console.error('Error processing form:', error);
        toast.error('An error occurred while processing the form');
      }
    
      
      const result = await sendContract_pre(data);
      setData(data);
    
      if (result?.success) {
        console.log({ data: result.data });
        toast.success('Contract sent');
        if(agreed === true){
            try {
          const response = await fetch('/api/sms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: `${data.phone}`, 
            }),
          });
          const smsData = await response.json();
          console.log('SMS sent with SID:', smsData.sid);
        } catch (error) {
          console.error('Failed to send SMS:', error);
        }
        reset();
        window.location.href = '/dashboard';
        return;
      }
      const formDataForDelete = new FormData();
      formDataForDelete.append('id', getValues("id"));
      deleteDraft(formDataForDelete);
    } else {
      console.log('Error sending contract:', result?.error);
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
        <h2>Seller phone: {contract.seller_phone}</h2>
        <h2>Seller email: {contract.seller_email}</h2>
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
          <input type="text" className="hidden" defaultValue={contract.seller_phone} {...register('user_phone')} />
          <input type="text" className="hidden" defaultValue={contract.seller_email} {...register('user_email')} />
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
                  Total sum: {contract.total
                              ? new Intl.NumberFormat("no-NO", {
                                  style: "currency",
                                  currency: "NOK"
                                }).format(contract.total)
                              : "Pris ikke angitt"} NOK eks. MVA
                </p>
              </div>

              <div className="border-t">
                <ul role="list" className="mt-2 max-w-xl text-gray-100">
                  <h2 className="text-xl font-semibold leading-6 text-gray-200">
                    Valgte produkter
                  </h2>
                  {contract.input?.map((input : any) => (
                    <li key={input.id} className="flex gap-x-3">
                      {input.comment !== "" ? (
                        <div className="flex-auto mt-2 mb-2">
                          <p className="text-base font-semibold leading-6 text-gray-200">
                            {input.name}
                          </p>
                          <p className="mt-2 text-base leading-7">{input.description}</p>
                          <p className="mt-2 text-base leading-7">Pris: {input.comment
                              ? new Intl.NumberFormat("no-NO", {
                                  style: "currency",
                                  currency: "NOK"
                                }).format(input.comment)
                              : "Pris ikke angitt"} eks. MVA</p>
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
              <Field as="div" className="flex gap-x-4 sm:col-span-2">
                      <div className="flex h-6 items-center">
                        <Switch
                          checked={agreed}
                          onChange={setAgreed}
                          className={classNames(
                            agreed ? 'bg-[#3B19F7]' : 'bg-gray-200',
                            'flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B19F7]'
                          )}
                        >
                          <span className="sr-only">Agree to policies</span>
                          <span
                            aria-hidden="true"
                            className={classNames(
                              agreed ? 'translate-x-3.5' : 'translate-x-0',
                              'h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out'
                            )}
                          />
                        </Switch>
                      </div>
                      <Label className="text-sm leading-6 text-gray-200">
                        Skjekk av hvis kunde ønsker SMS kontrakt bekreftelse.
                      </Label>
                    </Field>
          <div className="px-4 py-4 text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-gray-800 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isSubmitting ? "Sender inn..." : "Send"}
          </button>
          </div>
          </div>
            
          </div>
        </form>
      </div>
    ))}
  </div>
  );
}
