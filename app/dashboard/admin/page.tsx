import KontraktViewAdmin from '@/components/kontraktViewAdmin'
import { createClient } from '@/utils/supabase/server'
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }  
export default async function Page() {
    const supabase = createClient()
    const { data: {user}, error } = await supabase.auth.getUser()
    const { data: userAcc } = await supabase.from('contracts').select().order('date', { ascending: false })

    return (
        <div className='bg-black'>
            <div className="flex items-center justify-between border-b border-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-white">Admin dashboard | Alle kontrakter</h1>
              <div className='flex items-center gap-x-2'>
              <a href="/dashboard/contractform" className="bg-gray-600 rounded px-1 py-1 text-sm font-medium leading-5 text-white hover:text-indigo-100 hover:bg-gray-700">
                Lag en kontrakt | NO
              </a>
              <a href="/dashboard/contractegendef" className="bg-gray-600 rounded px-1 py-1 text-sm font-medium leading-5 text-white hover:text-indigo-100 hover:bg-gray-700">
                Lag en kontrakt | Egendefinert
              </a>
              </div>
            </div>
            <KontraktViewAdmin contracts={userAcc || []} />
        </div>
    )
}