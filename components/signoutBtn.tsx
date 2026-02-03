"use client"

import { createClient } from '@/utils/supabase/client'


export default function SignoutBtn() {
    const supabase = createClient()
    
    async function signOut() {
        const {error} = await supabase.auth.signOut();
        
        window.location.href = '/';
    }

    return (
        <button
            onClick={signOut}
            className="bg-gray-600 rounded px-1 py-1 text-sm font-medium leading-5 text-white hover:text-indigo-100 hover:bg-gray-700"
        >
            Logg ut
        </button>
    )
}