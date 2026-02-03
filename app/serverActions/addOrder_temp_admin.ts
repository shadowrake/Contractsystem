"use server"

import { createClient } from "../../utils/supabase/server"
import {cookies} from 'next/headers'

export async function addOrder_temp(formData: FormData) {
    const seller = formData.get('seller')
    const buyer = formData.get('buyer')
    const orgnr = formData.get('orgnr')
    const address = formData.get('address')
    const contactPerson = formData.get('contact')
    const email = formData.get('email')
    const phone = formData.get('phone')
    const total = formData.get('total')
    const comment = formData.get('comment')
    const user_id = formData.get('user_id')
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

    const { data: users } = await supabase.from('profiles').select().eq('id', user_id).single()

    const {data, error} = await supabase
    .from('contracts_temp')
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
            user_id: user_id,
            seller_email: users?.user_email,
            seller_phone: users?.user_phone
        }])

    if (error) {
        console.error('Error inserting contract:', error)
        return
    }




 
}