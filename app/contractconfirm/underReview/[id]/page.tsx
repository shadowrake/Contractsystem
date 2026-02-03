import { createClient } from "@/utils/supabase/server"
import { redirect } from 'next/navigation'
import ContractForm from "@/components/buttonConfirm";
export default async function Page({params}: {params: any}) {
    const supabase = createClient()

    const { data: contract } = await supabase.from('contracts').select().eq('id', params.id)

    const { data: userErr } = await supabase.from('contracts').select().eq('id', params.id).single()

    if(null === userErr){
      redirect(`/not-found`)
    }

    if (userErr.status === 'Godkjent'){
        redirect(`/contractconfirm/confirmed/${params.id}`)
    }

    if (userErr.status === 'Avvist'){
      redirect(`/contractconfirm/denied/${params.id}`)
    }

    const date = new Date(userErr.date)
    
    return (
    <div className="bg-black">
        {contract?.map((contract: Contract) => (
        <div className="" key={contract.id}>
        <div className="flex flex-col items-center border-b border-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-base font-semibold leading-7 text-white">Kontrakt ID: {contract.id}</h1>
          <h2>Seller: {contract.seller}</h2>
          {contract.status === 'underReview' ? <h2>Status: Venter på godkjenning</h2> : null}
          <h2>Dato: {date.toDateString()} @ {date.toLocaleTimeString("nb-NO", { timeZone: "Europe/Oslo" })}</h2>
        </div>
    <div className="bg-black px-6 py-32 lg:px-8">
    <div className="flex flex-col items-center">
          <div>
            <ContractForm contractId={contract.id}></ContractForm>
          </div>
      </div>
    </div>
    </div>
    ))}
    </div>
    )
}