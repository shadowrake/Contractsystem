import { createClient } from "@/utils/supabase/server"
import { redirect } from 'next/navigation'
import DownloadPdf from "@/components/pdf_vilkår"
export default async function Page({params}: {params: any}) {
    const supabase = createClient()

    const { data: contract } = await supabase.from('contracts').select().eq('id', params.id)

    const { data: userErr } = await supabase.from('contracts').select().eq('id', params.id).single()

    if (userErr.status === 'underReview'){
      redirect(`/contractconfirm/underReview/${params.id}`)
    }
    if(userErr.status === 'Avvist'){
      redirect(`/contractconfirm/denied/${params.id}`)
    }

    const date = new Date(userErr.date)

    const yearPrice = userErr.total * 12
    
    return (
      <div className="bg-black">
      {contract?.map((contract: Contract) => (
      <div key={contract.id}>
      <div className="flex flex-col items-center border-b border-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-base font-semibold leading-7 text-white">Kontrakt ID: {contract.id}</h1>
        <h2>Seller: {contract.seller}</h2>
        <h2>Status: {contract.status}</h2>
        <h2>Dato: {date.toDateString()} @ {date.toLocaleTimeString("nb-NO", { timeZone: "Europe/Oslo" })}</h2>
      </div>
  <div className="bg-black px-6 py-32 lg:px-8">
  <div className="flex flex-col items-center">
        <div>
          <p>Du har godkjent vilkårene.</p>
          <DownloadPdf></DownloadPdf>
        </div>
    </div>
  </div>
  </div>
  ))}
  </div>
    )
}