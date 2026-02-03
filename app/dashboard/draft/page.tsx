"use server"
import { createClient } from '@/utils/supabase/server'

const statuses = {
  underReview: 'text-yellow-400 bg-gray-100/10',
  Godkjent: 'text-green-400 bg-green-400/10',
  Avvist: 'text-red-600 bg-rose-400/10',
  Utkast: 'text-gray-300 bg-yellow-400/10',
}
const environments = {
  View: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
}
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
} 



export default async function Page() {
    const supabase = createClient()
    const { data: {user}, error } = await supabase.auth.getUser()
    if (error || !user?.id) {
        return
    }

    const { data: Contract } = await supabase.from('contracts_temp').select().eq('user_id', user.id).order('date', { ascending: false })
    return (
        <div className="bg-black">
            <div className="flex items-center bg-black justify-between border-b border-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-white">Dashboard | Mine utkast kontrakter</h1>
              <div className='flex items-center gap-x-2'>
              <a href="/dashboard/contractform" className="bg-gray-600 rounded px-1 py-1 text-sm font-medium leading-5 text-white hover:text-indigo-100 hover:bg-gray-700">
                Lag en kontrakt | NO
              </a>
              <a href="/dashboard/contractformse" className="bg-gray-600 rounded px-1 py-1 text-sm font-medium leading-5 text-white hover:text-indigo-100 hover:bg-gray-700">
                Lag en kontrakt | SE
              </a>
              </div>
            </div>

            <ul role="list" className="divide-y divide-white/5">
              {Contract?.map((contracts: Contract, index) => (
                <li key={contracts.id} className="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="min-w-0 flex-auto">
                  <div className="flex items-center gap-x-3">
                  <div className={classNames(statuses[contracts.status as keyof typeof statuses], 'flex-none rounded-full p-1')}>
                    <div className="h-2 w-2 rounded-full bg-current" />
                  </div>
                  <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
                    
                      <span className="truncate">#{index + 1} {contracts.seller}</span>
                      <span className="text-gray-400">/</span>
                      <span className="whitespace-nowrap">{contracts.buyer}</span>
                  </h2>
                  </div>
                  <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
                    <p className="truncate"></p>
                  </div>
                </div>

                <a href={`/dashboard/draft/${contracts.id}`}>
                <div
                  className={classNames(
                    environments[contracts.environment as keyof typeof environments],
                    'rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset'
                  )}
                >
                  {contracts.environment}
                </div>
                </a>
              </li>
              ))}
            </ul>
          </div>
    )
}