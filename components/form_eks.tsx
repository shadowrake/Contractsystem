"use client"
import React from 'react'
import { useState, useEffect } from 'react'
import { Field, Label, Switch } from '@headlessui/react'
import { createClient } from '@/utils/supabase/client'
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from 'sonner'
import { sendContractWithUpload } from '@/app/actions'
import { useRef } from "react";
import { addOrder } from '@/app/serverActions/addOrder'
import { addOrder_temp } from '@/app/serverActions/addOrder_temp'


function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

export default function Form({ users, produkter, countries }: { users: Users[], produkter: Produkter[], countries: Countries[] }) {
    const [agreed, setAgreed] = useState(false);
    const [items, setItems] = useState<Produkter[]>(produkter);
    const [isReadyToSend, setIsReadyToSend] = useState<boolean>(false);
    const [data, setData] = useState<ContractFormInputs>();
    const [totalPrice, setTotalPrice] = useState(0);
    const [prefix, setPrefix] = useState('+47');
    const supabase = createClient();

    const groupedProducts = items.reduce((acc, product) => {
      const category = product.category || 'Uten kategori';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Produkter[]>);

     const categoryOrder = ['Nettside', 'Pakkeløsning', 'Annonsering', 'Film og foto', 'Organisk annonsering', 'Rådgiving', 'Annet'];
    
     const categories = Object.keys(groupedProducts).sort((a, b) => {
       const indexA = categoryOrder.indexOf(a);
       const indexB = categoryOrder.indexOf(b);
       
  
       if (indexA !== -1 && indexB !== -1) {
         return indexA - indexB;
       } else if (indexA !== -1) {
         return -1;
       } else if (indexB !== -1) {
         return 1;
       } else {
         return a.localeCompare(b); 
       }
     });

    

    const input = Object.values(produkter).map((item) => ({
      id: item.id.toString(),
      name: item.name,
      comment: '',
      description: item.description,
    }));
    const handleChangePrefix = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newPrefix = event.target.value;
    setPrefix(newPrefix);

    // Update the phone value by replacing the old prefix with the new one
    const currentPhone = getValues('phone');
    if (currentPhone.startsWith(prefix)) {
      setValue('phone', newPrefix + currentPhone.slice(prefix.length));
    } else {
      setValue('phone', newPrefix + currentPhone);
    }
    };

        const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
          const newName = event.target.value;
          const updatedItems = items.map((item) =>
            item.id === itemId ? { ...item, name: newName } : item
          );
          setItems(updatedItems);
        };
        const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
            const newDescription = event.target.value;
            const updatedItems = items.map((item) =>
              item.id === itemId ? { ...item, description: newDescription } : item
            );
            setItems(updatedItems);
          };
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked, dataset } = event.target;
        const itemId = parseInt(dataset.id!);
    
        const updatedItems = items.map((item) =>
          item.id === itemId ? { ...item, checked } : item
        );
    
        setItems(updatedItems);
      };

      const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
        const newPrice = parseFloat(event.target.value) || 0;

    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, price: newPrice } : item
    );
    setItems(updatedItems);
    calculateTotalPrice(updatedItems);
      };

      const calculateTotalPrice = (items: any[]) => {
        const newTotalPrice = items.reduce((sum, item) => {
          return item.checked ? sum + item.price : sum;
        }, 0);
    
        setTotalPrice(newTotalPrice);
      };
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
        id: '',
        seller: `${users[0]?.first_name} ${users[0]?.last_name}`,
        buyer: '',
        orgnr: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        input: input,
        total: 0,
        comment: '',
        user_email: users[0]?.email,
        user_phone: users[0]?.phone,
      },
    });

    useEffect(() => {
      setValue('total', totalPrice);
    }, [totalPrice, setValue]);
    
    const fileRef = useRef<HTMLInputElement | null>(null);

// Helper to base64 (strips "data:*;base64," prefix)
async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const base64 = dataUrl.split(",")[1] || ""; // keep only the base64 payload
  return base64;
}

    const processForm: SubmitHandler<ContractFormInputs> = async data => {
      if(!data.buyer || !data.orgnr || !data.contact || !data.email || !data.phone || !data.address || !data.input || !data.total || !data.comment || !data.seller) {
        toast.error('Ingen felt kan være tomme');
      } else {
      const formData = new FormData();
      try {
        formData.append('seller', users[0]?.first_name + " " + users[0]?.last_name);
        formData.append('buyer', getValues('buyer'));
        formData.append('orgnr', getValues('orgnr'));
        formData.append('contact', getValues('contact'));
        formData.append('email', getValues('email'));
        formData.append('phone', getValues('phone'));
        formData.append('address', getValues('address'));
        formData.append('input', JSON.stringify(getValues('input')));
        formData.append('total', getValues('total').toString());
        formData.append('comment', getValues('comment'));
    
        const result = await addOrder(formData);
  
      } catch (error) {
        // Handle any errors that occurred during the FormData processing or addOrder call
        console.error('Error processing form:', error);
        toast.error('An error occurred while processing the form');
        return;
      }

      let attachment = null as
    | { filename: string; base64: string; contentType?: string }
    | null;

  const file = fileRef.current?.files?.[0] ?? null;
  if (file) {
    const base64 = await fileToBase64(file);
    attachment = {
      filename: file.name,
      base64,
      contentType: file.type || "application/pdf",
    };
  }

      const result = await sendContractWithUpload(data, attachment);
      setData(data);
    
      if (result?.success) {
        console.log('Contract sent successfully');
        toast.success('Contract sent');
        const generateMessageBody = (input: { comment: string; name: string; description: string }[]) => {
          let messageBody = `Hei, \nDu har nettopp kjøpt tjenesten/tjenestene: \n`;
        
          input.forEach(item => {
            if (item.comment.trim() !== '') {
              messageBody += `${item.name}: \n${item.comment}\n${item.description}\n\n`;
            }
          });

        };
        if(agreed === true){
            try {
          const messageBody = generateMessageBody(input);
          const response = await fetch('/api/sms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: `${data.phone}`, 
              body: messageBody,
            }),
          });
          const smsData = await response.json();
          console.log('SMS sent with SID:', smsData.sid);
        } catch (error) {
          console.error('Failed to send SMS:', error);
        }
        }
        reset();
        window.location.href = '/dashboard';
        return;
      }
    

      console.log(result?.error);
      toast.error('Contract failed to send');
    }
  }


    const handleDraft = async () => {
      const buyer = getValues('buyer');
      const orgnr = getValues('orgnr');
      const contact = getValues('contact');
      const email = getValues('email');
      const phone = getValues('phone');
      const address = getValues('address');
      const inputVal = getValues('input');
      const total = getValues('total');
      const comment = getValues('comment');
      const seller = users[0]?.first_name + " " + users[0]?.last_name;
      if(!buyer ||
        !orgnr ||
        !contact ||
        !email ||
        !phone ||
        !address ||
        !inputVal ||
        !total ||
        !comment ||
        !seller) {
        toast.error('Ingen felt kan være tomme');
      } else {
      const formData = new FormData();
      try {
        formData.append('seller', users[0]?.first_name + " " + users[0]?.last_name);
        formData.append('buyer', getValues('buyer'));
        formData.append('orgnr', getValues('orgnr'));
        formData.append('contact', getValues('contact'));
        formData.append('email', getValues('email'));
        formData.append('phone', getValues('phone'));
        formData.append('address', getValues('address'));
        formData.append('input', JSON.stringify(getValues('input')));
        formData.append('total', getValues('total').toString());
        formData.append('comment', getValues('comment'));
    
        console.log('Form data:', formData.get('input'));

        const result = await addOrder_temp(formData);

        return { success: true, data: result };
      }
      catch (error) {
        console.error('Error saving draft:', error);
        return { success: false, error: error };
      }
    }
    }
    

    useEffect(() => {
      // Set the initial phone value with the default prefix
      setValue('phone', prefix);
    }, [prefix, setValue]);

    return (
      <div className="isolate bg-black px-6 py-24 sm:py-32 lg:px-8">
        {users?.map((user) => (
          <div key={user.id}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">Herman Kristiansen interne kontraktsystem</h2>
        <p className="mt-2 text-lg leading-8 text-gray-100">
          Fyll ut skjemaet under for å lage en egendefinert kontrakt for din bedrift.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(processForm)} className="mx-auto mt-16 max-w-xl sm:mt-20">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <input 
                    type="text"
                    id="title"
                    value={user.first_name}
                    maxLength={75}
                    autoComplete="off"
                    className="hidden block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    {...register("seller")} />
          <div>
            <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-gray-200">
              Firmanavn:
            </label>
            <div className="mt-2.5">
              <input
                type="text"
                id="first-name"
                autoComplete="given-name"
                maxLength={75}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...register("buyer", {required: "Firmanavn er påkrevd"})}
              />
              {errors.buyer && (
                <p className="text-red-500 text-sm mt-1">{errors.buyer.message}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="last-name" className="block text-sm font-semibold leading-6 text-gray-200">
              Org. nr:
            </label>
            <div className="mt-2.5">
              <input
                type="number"
                id="orgnr"
                autoComplete="family-name"
                min={100000000}
                max={999999999}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...register("orgnr", {required: "Org.nr er påkrevd"})}
              />
              {errors.orgnr && (
                <p className="text-red-500 text-sm mt-1">{errors.orgnr.message}</p>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="company" className="block text-sm font-semibold leading-6 text-gray-200">
              Kontaktperson:
            </label>
            <div className="mt-2.5">
              <input
                type="text"
                id="company"
                autoComplete="organization"
                maxLength={75}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...register("contact", {required: "Kontaktperson er påkrevd"})}
              />
              {errors.contact && (
                <p className="text-red-500 text-sm mt-1">{errors.contact.message}</p>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-200">
              E-post:
            </label>
            <div className="mt-2.5">
              <input
                type="email"
                id="email"
                autoComplete="email"
                maxLength={40}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...register("email", {required: "E-post er påkrevd"})}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="phone-number" className="block text-sm font-semibold leading-6 text-gray-200">
              Telefon:
            </label>
                <div className="relative mt-2.5">
                <div className="absolute inset-y-0 left-0 flex items-center">
              <label htmlFor="country" className="sr-only">
                Country
              </label>
              
              <select
                id="country"
                name="country"
                autoComplete="country"
                className="h-full rounded-md border-0 bg-transparent py-0 pl-3 pr-2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                value={prefix}
                onChange={handleChangePrefix}
              >
                {countries.map((country) => (
                  <option key={country.id} value={country.prefix}>
                    {country.short_name}
                  </option>
                ))}
              </select>
              
            </div>
              <input
                type="tel"
                id="phone-number"
                autoComplete="tel"
                min={0}
                maxLength={11}
                className="block w-full rounded-md border-0 py-1.5 pl-16 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...register("phone", {required: "Telefon er påkrevd"})}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-semibold leading-6 text-gray-200">
              Fakturaadresse:
            </label>
            <div className="relative mt-2.5">
              <input
                type="address"
                id="address"
                autoComplete="tel"
                maxLength={75}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...register("address", {required: "Adresse er påkrevd"})}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>
          {categories.map((category) => (
          <div key={category} className="sm:col-span-2 border-t pt-4 mt-4">
            <h3 className="text-lg font-bold text-gray-200 mb-3">{category}</h3>
            
            {[...groupedProducts[category]]
              .sort((a, b) => a.order_num - b.order_num)
              .map((produkt, index) => {
              // Find index in the original items array for register
              const originalIndex = items.findIndex(item => item.id === produkt.id);
              return (
                <div key={produkt.id} className="mb-4 pb-4 border-b border-gray-700">
                    <div className="flex items-center">
                    <input
                      id={`produkt-${produkt.id}`}
                      name={`produkt-${produkt.id}`}
                      type="checkbox"
                      data-id={produkt.id.toString()}
                      data-type="checked"
                      checked={produkt.checked}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                    <label
                      htmlFor={`produkt-${produkt.name}`}
                      className="ml-2 block text-sm font-semibold text-gray-200"
                    >
                      Egendefinert pakke
                    </label>
                  </div>
                  {produkt.checked && (
                    <div>
                <div className="mt-4 ml-6">
                    <label>
                        Pakkenavn
                    </label>
                    <input
                        type="text"
                        minLength={5}
                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        defaultValue={items[originalIndex]?.name || ''}
                        {...register(`input.${originalIndex}.name`, {
                          required: "Pakke navn er påkrevd",
                          onChange: (event) => handleNameChange(event, produkt.id)
                        })}
                    />

                    {errors?.input && errors.input[originalIndex] && (
                        <p className="text-red-500 text-sm mt-1">{errors.input[originalIndex]?.name?.message}</p> 
                    )}
                </div>
                <div className="mt-4 ml-6">
                    <label>
                        Beskrivelse
                    </label>
                    <textarea
                        rows={4}    
                        minLength={10}
                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        {...register(`input.${originalIndex}.description`, {
                            required: "Beskrivelse er påkrevd",
                            onChange: (event) => handleDescriptionChange(event, produkt.id)
                        })}
                    />
                    {errors?.input && errors.input[originalIndex] && (
                        <p className="text-red-500 text-sm mt-1">{errors.input[originalIndex]?.description?.message}</p>
                    )}
                </div>
                <div className="mt-4 ml-6">
                    <label>
                        Pris
                    </label>
                      <div className="relative">
                        <input
                          id={`pris-${produkt.id}`}
                          autoComplete="pris"
                          className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          type="number"
                          min={1000}
                          max={9999999}
                          data-type="price"
                          {...register(`input.${originalIndex}.comment`, {required: "Pris er påkrevd"})}
                          onChange={(event) => handlePriceChange(event, produkt.id)}
                          onKeyDown={(e) => { if (e.key === '-' || e.key === '+' || e.key === "e" || e.key === "E") e.preventDefault(); }}
                        />
                        {errors?.input && errors.input[originalIndex] && (
                          <p className="text-red-500 text-sm mt-1">{errors.input[originalIndex]?.comment?.message}</p>
                        )}
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      <div className='border-t'>
      <label htmlFor="comment" className="block text-sm font-medium leading-6 text-gray-200">
        Kommentar
      </label>
      <div className="mt-2">
        <textarea
          rows={4}
          id="comment"
          className="block w-full rounded-md pl-3 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black-600 focus:border-black sm:text-sm sm:leading-6"
          defaultValue={''}
          minLength={0}
          maxLength={2400}
          {...register('comment')}
        />
      </div>
      <label htmlFor="attachment" className="block text-sm font-semibold leading-6 text-gray-200">
        Last opp vedlegg (PDF)
      </label>
      <input
        id="attachment"
        name="attachment"
        type="file"
        accept="application/pdf"
        ref={fileRef}
        className="mt-2 block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
      <p className="text-xs text-gray-400 mt-1">Maks ~10 MB anbefalt.</p>

      <Field as="div" className="flex gap-x-4 sm:col-span-2">
                            <div className="flex h-6 items-center">
                              <Switch
                                disabled
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
    </div>
        {items.some(item => item.checked) && (
        <div className="border-t">
                    {items.some(item => item.checked) && (
                      <div className="mt-2">
                        <p className="text-gray-200">Valgte produkter:</p>
                        <ul className="list-disc list-inside list-none text-gray-200">
                          {items.filter(item => item.checked).map(item => (
                            <div key={item.id} className="flex flex-col gap-2">
                            <li key={item.id} className="text-gray-200 ">{item.name}</li>
                            <li key={item.id} className="text-gray-200 ">+ {item.price
                              ? new Intl.NumberFormat("no-NO", {
                                  style: "currency",
                                  currency: "NOK"
                                }).format(item.price)
                              : "Pris ikke angitt"}</li>
                            </div>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  )}
        <br />
        <div className="border-t">
          <p className='text-gray-200'>Sum (eks. MVA): {totalPrice}</p>
        </div>
        <h1 className='text-red-600 text-xl font-bold'>HUSK Å DOBBELSKJEKK ALL INFORMASJON FØR DU SENDER EN KONTRAKT!</h1>
        <div className="flex gap-3 mt-4">
        {/* Send button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-gray-800 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {isSubmitting ? "Sender inn..." : "Send"}
        </button>
        
        {/* Draft button */}
        <button
          type="button" 
          onClick={handleDraft}
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-gray-800 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {isSubmitting ? "Lagrer..." : "Lagre utkast"}
        </button>
      </div>
      </div>
      </form>
      </div>
          ))}
    </div>
    )
}