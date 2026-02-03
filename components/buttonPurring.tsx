'use client';
import React from 'react';
import { toast } from 'sonner';
import { useState } from 'react';
import {sendPurring } from '@/app/actions'
import { addToCounter } from '@/app/serverActions/addToCounter';

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const PurringButton = ({ contracId }: { contracId: string }) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        setIsSubmitting(true);

        const result = await sendPurring(contracId);

        try {
            const res = await addToCounter(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred while processing the form');
        }

        toast.success('Purringen har blitt sendt');


        await sleep(2000)
       
        window.location.reload();
    };

    return (
        <div>
        <form onSubmit={handleSubmit}>
            <input type="hidden" name="status" value="underReview" />
            <input type="hidden" name="id" value={contracId} />
            <br />
            <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                {isSubmitting ? 'Sender...' : 'Send påminnelse'}
            </button>
        </form>
    </div>
    );
};

export default PurringButton;