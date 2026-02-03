"use server"

import { createClient } from "../../utils/supabase/server"
import {cookies} from 'next/headers'

export async function deleteDraft(formData: FormData){
    const uuid = formData.get('id')
    const cookieStore = cookies()
    const supabase = createClient()

    console.log("Deleting order", uuid)

    const {data, error} = await supabase
    .from('contracts_temp')
    .delete()
    .eq('id', uuid)

    if (error) {
        return {
            status: 500,
            error: error.message,
            redirect: '/error'
        };
    }
}