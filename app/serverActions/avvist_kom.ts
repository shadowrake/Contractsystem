"use server"

import { createClient } from "../../utils/supabase/server"
import { revalidatePath } from "next/cache"
import {cookies} from 'next/headers'
import { redirect } from "next/navigation"

export async function avvist_kom(formData: FormData){
    const kommentar = formData.get('avvis_kom')
    const uuid = formData.get('id')
    const cookieStore = cookies()
    const supabase = createClient()

    const { data: {user}} = await supabase.auth.getUser()
    if (!user?.id) {
        console.error('Error fetching user:')
    }

    const {data, error} = await supabase
    .from('contracts')
    .update({avvis_kom: kommentar})
    .eq('id', uuid)

    if (error) {
        return {
            status: 500,
            error: error.message,
            redirect: '/error'
        };
    }

    revalidatePath('/', "layout")
    redirect(`/contractconfirm/confirmed/${uuid}`)
}