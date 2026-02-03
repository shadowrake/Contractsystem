"use server"

import { createClient } from "../../utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function addToCounter(formData: FormData){
    const uuid = formData.get('id')
    const supabase = createClient()

    const { data: currentContract, error: fetchError } = await supabase
    .from('contracts')
    .select('purre_counter')
    .eq('id', uuid)
    .single(); 

    const updatedCounter = currentContract?.purre_counter + 1;

    const { data: {user}} = await supabase.auth.getUser()
    if (!user?.id) {
        console.error('Error fetching user:')
    }

    const {data, error} = await supabase
    .from('contracts')
    .update({purre_counter: updatedCounter})
    .eq('id', uuid)

    if (error) {
        return {
            status: 500,
            error: error.message,
            redirect: '/error'
        };
    }

    revalidatePath('/', "layout")
}