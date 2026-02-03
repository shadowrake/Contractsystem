import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'


export default async function dashboardLayout ({ children }: { children: React.ReactNode })  {
    const supabase = createClient()
    const { data: {user}, error } = await supabase.auth.getUser()
    if (error || !user?.id) {
        redirect('/login')
    }


    const { data: userAcc } = await supabase.from('profiles').select().eq('id', user.id).single()

    if (userAcc.role != 'admin') {
        redirect('/dashboard')
    }
  return (
    <>
      <div>
        {children}
      </div>
    </>
  )
}
