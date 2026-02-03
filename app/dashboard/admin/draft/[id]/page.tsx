import { createClient } from "@/utils/supabase/server"
import { redirect } from 'next/navigation'
import Draft from "@/components/draft_admin"


export default async function Page({params}: {params: any}) {
    const supabase = createClient()
    const { data: {user}, error } = await supabase.auth.getUser()
    if (error || !user?.id) {
        return
    }

    const { data: contract } = await supabase.from('contracts_temp').select().eq('id', params.id)

    const { data: userErr } = await supabase.from('contracts_temp').select().eq('id', params.id).single()

    const { data: profiles } = await supabase.from('profiles').select().eq('id', user?.id).single()

    if (profiles?.role != 'admin'){
        redirect('/dashboard')
    }

    const date = new Date(userErr.date)

    const monthPrice = userErr.total / 12
    const intMonthPrice = Math.round(monthPrice)
    
    return (
      <main>
        <Draft contracts={contract as Contract[]} />
      </main>
    )
}