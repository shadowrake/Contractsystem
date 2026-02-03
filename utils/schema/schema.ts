import {z} from 'zod';

export const ContractSchema = z.object({
    id: z.string(),
    seller: z.string(),
    buyer: z.string(),
    orgnr: z.string().length(9),
    contact: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    input: z.array(z.object({
        id: z.string(),
        name: z.string(),
        comment: z.string(),
        description: z.string()
    })),
    total: z.coerce.number(),
    comment: z.string(),
    user_id: z.string().optional(),
    user_email: z.string().optional(),
    user_phone: z.string().optional(),
    });