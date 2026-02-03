'use server'

import React from 'react'
import { createClient } from '@/utils/supabase/server'
import Form from '@/components/form'
import DownloadPdf from "@/components/pdf_vilkår"

export default async function formContract() {
  const supabase = createClient()

  

  const { data: {user}, error } = await supabase.auth.getUser()
  if (error || !user?.id) {
    return
  }

  const { data: users } = await supabase.from('profiles').select().eq('id', user.id)
  const { data: produkter} = await supabase.from('produkter').select()
  const { data: countries } = await supabase.from('countries').select()
  return (
    <main>
      <div className="flex flex-col items-center border-b border-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <DownloadPdf />
      </div>
      <Form users={users as Users[]} produkter={produkter as Produkter[]} countries={countries as Countries[]} />
    </main>
  )
}