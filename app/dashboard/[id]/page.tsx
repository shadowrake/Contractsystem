import { createClient } from "@/utils/supabase/server"
import { redirect } from 'next/navigation'
import DeleteOrder from "@/components/deleteOrder"
import DownloadPdf from "@/components/pdf_vilkår"
import PurringButton from "@/components/buttonPurring"
export default async function Page({params}: {params: any}) {
    const supabase = createClient()
    const { data: {user}, error } = await supabase.auth.getUser()
    if (error || !user?.id) {
        return
    }

    const { data: contract } = await supabase.from('contracts').select().eq('id', params.id)

    const { data: userErr } = await supabase.from('contracts').select().eq('id', params.id).single()

    if (user?.id != userErr?.user_id){
        redirect('/dashboard')
    }

    const date = new Date(userErr.date)

    const monthPrice = userErr.total / 12
    const intMonthPrice = Math.round(monthPrice)
    
    return (
    <div className="">
        {contract?.map((contract: Contract) => (
        <div key={contract.id}>
        <div className="flex flex-col items-center border-b border-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-base font-semibold leading-7 text-white">Kontrakt ID: {contract.id}</h1>
          {contract.status === 'underReview' ? <h2>Status: Venter på godkjenning</h2> : <h2>Status: {contract.status}</h2>}
          <h2>Seller: {contract.seller}</h2>
          <h2>Dato: {date.toDateString()} @ {date.toLocaleTimeString("nb-NO", { timeZone: "Europe/Oslo" })}</h2>
          <DownloadPdf />
          {contract.status === 'underReview' && contract.orgnr.length == 9 ? (
          <div className="border-t mt-8">
            <DeleteOrder contractId={contract.id}></DeleteOrder>
          </div>
          ) : null}
        </div>
    <div className="bg-black px-6 py-32 lg:px-8">
    
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-200">
        <div className="mb-8">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">Bedrift: {contract.buyer}</h1> <p className="text-md">OrgNr.{contract.orgnr}
        </p>
        <p className="text-md">Kontaktperson: {contract.contact}</p>
        <p className="mt-6 text-md leading-8">
            Tlf:{contract.phone} | Epost: {contract.email}
        </p>
        <p className="mt-2 text-md leading-8">
            Adresse: {contract.address} 
        </p>
          <p className="mt-2 text-md leading-8">
            Total sum: {contract.total} NOK eks. MVA
          </p>
          </div>
          <div className="border-t">
          <ul role="list" className="mt-2 max-w-xl text-gray-100">
            <h2 className="text-xl mb-2 font-semibold leading-6 text-gray-200">Valgte produkter</h2>
            {contract?.input?.map((input: any) => (
            <li key={input.id} className="flex gap-x-3">
                {input.comment !== '' ? (
                <div className="flex-auto mt-5 mb-5">
                    <p className="text-base font-semibold leading-6 text-gray-200">{input.name}</p>
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
            <h2 className="mt-8 text-xl font-semibold leading-6 text-gray-200">Kommentar</h2>
          <p className="mt-2">
            {contract.comment}
          </p>
          </div>
          {contract.status === 'Avvist' ? (
          <div className="border-t mt-8">
            <h2 className="mt-8 text-xl font-semibold leading-6 text-gray-200">Tilbakemeldig for avvising</h2>
          <p className="mt-2">
            {contract.avvis_kom}
          </p>
          </div>
          ) : null}

          {contract.status === 'underReview' && contract.orgnr.length == 9 ? (
          <div className="border-t mt-8">
            <PurringButton contracId={contract.id}></PurringButton>
          </div>
          ) : null}
      </div>
    </div>
    </div>
    ))}
    </div>
    )
}