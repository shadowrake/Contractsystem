"use server"
import { createClient } from "../../utils/supabase/server"
import { revalidatePath } from "next/cache"
import {cookies} from 'next/headers'
import { redirect } from "next/navigation"

export async function addOrder_mock(formData: FormData) {
    const seller = formData.get('seller')
    const buyer = formData.get('buyer')
    const orgnr = formData.get('orgnr')
    const address = formData.get('address')
    const contactPerson = formData.get('contact')
    const email = formData.get('email')
    const phone = formData.get('phone')
    const total = formData.get('total')
    const comment = formData.get('comment')
    const input1 = formData.getAll('input').filter(input => input !== '');
    // Parse and flatten input JSON strings into an array, a bit weird implementation but works
    const input = input1.flatMap(inputEntry => {
        if (typeof inputEntry === 'string') {
            try {
                const parsedJson = JSON.parse(inputEntry);
                console.log(parsedJson);
                return Array.isArray(parsedJson) ? parsedJson : [parsedJson];
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return [];
            }
        } else {
            console.error('Invalid input type, expected string but got File.');
            return [];
        }
    });
    const cookieStore = cookies()
    const supabase = createClient()

    const { data: {user}} = await supabase.auth.getUser()
    if (!user?.id) {
        console.error('Error fetching user:')
    }

    const {data, error} = await supabase
    .from('contracts_temp_mock')
    .insert([
        {
            seller: seller,
            buyer: buyer,
            orgnr: orgnr,
            address: address,
            contact: contactPerson,
            email: email,
            phone: phone,
            input: input,
            total: total,
            comment: comment,
            user_id: user?.id,
            seller_email: user?.email
        }])

        if (error) {
          console.error('Supabase insert error:')
          console.error('Message:', error.message)
          console.error('Details:', error.details)
          console.error('Hint:', error.hint)
          console.error('Code:', error.code)
          console.error('Full error object:', JSON.stringify(error, null, 2))
        
          throw new Error(error.message || 'Unknown insert error')
        }
      
    
    revalidatePath('/dashboard/draft');
    redirect('/dashboard/draft')
}