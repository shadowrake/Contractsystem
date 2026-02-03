'use server'

import React from 'react'
import { createClient } from '@/utils/supabase/server'
import Form from '@/components/formUtkast'

export default async function formContract() {
  const supabase = createClient()

  

  const { data: {user}, error } = await supabase.auth.getUser()
  if (error || !user?.id) {
    return
  }

  const { data: users } = await supabase.from('profiles').select().eq('id', user.id)
  const { data: produkter} = await supabase.from('produkter').select()
  const { data: countries } = await supabase.from('countries').select()
  const { data: profiles } = await supabase.from('profiles').select()
  return (
    <main>
      <Form users={users as Users[]} produkter={produkter as Produkter[]} countries={countries as Countries[]} profiles={profiles as Profiles[]} />
    </main>
  )
}