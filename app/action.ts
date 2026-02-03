'use server'

import { createClient } from "@/utils/supabase/server"

interface State {
    message: string;
    error: string;
    success?: boolean;
}

export async function login(prevState: State, formData: FormData): Promise<State> {
    try {
        const supabase = createClient()
        
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }

        const { error } = await supabase.auth.signInWithPassword(data)

        if (error) {
            return {
                message: '',
                error: error.message,
                success: false
            }
        }

        return {
            message: 'Success',
            error: '',
            success: true
        }
    } catch (error) {
        return {
            message: '',
            error: error instanceof Error ? error.message : 'An error occurred during login',
            success: false
        }
    }
}