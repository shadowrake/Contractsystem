"use server"
import { createClient } from '@/utils/supabase/server'
import KontraktView from '@/components/kontraktView'


export default async function Page() {
    const supabase = createClient()
    const { data: {user}, error } = await supabase.auth.getUser()
    if (error || !user?.id) {
        return
    }

    

    const { data: contract } = await supabase.from('contracts').select().eq('user_id', user.id).order('date', { ascending: false })
    const { data: users } = await supabase.from('profiles').select().eq('id', user.id).single()

    return (
        <div className="bg-black">
            <div className="flex items-center bg-black justify-between border-b border-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-white">Dashboard | Mine kontrakter</h1>
              <div className='flex items-center gap-x-2'>
              <a href="/dashboard/contractform" className="bg-gray-600 rounded px-1 py-1 text-sm font-medium leading-5 text-white hover:text-indigo-100 hover:bg-gray-700">
                Lag en kontrakt | NO
              </a>
              {users?.canMakeEgendef === true ? (
              <a href="/dashboard/contractegendef" className="bg-gray-600 rounded px-1 py-1 text-sm font-medium leading-5 text-white hover:text-indigo-100 hover:bg-gray-700">
                Lag en kontrakt | Egendefinert
              </a>
              ) : (
                null
              )}
              {users?.canMakeStorDeal === true ? (
              <a href="/dashboard/contracteks" className="bg-gray-600 rounded px-1 py-1 text-sm font-medium leading-5 text-white hover:text-indigo-100 hover:bg-gray-700">
                Lag en kontrakt | Stor deal
              </a>
              ) : (
                null
              )}
              </div>
            </div>

            <KontraktView contracts={contract || []} />
          </div>
    )
}