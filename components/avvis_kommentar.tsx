'use client';
import React from 'react';
import { toast } from 'sonner';
import { updateStatus } from "@/app/serverActions/updateStatus";
import { useState } from 'react';
import { sendAvvis, sendGodkjennelse } from '@/app/actions'
import DownloadPdf from './pdf_vilkår';
import { avvist_kom } from '@/app/serverActions/avvist_kom';

const Avvis_kom = ({ contractId }: { contractId: string }) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        
        setIsSubmitting(true);

        try {
            const result = await avvist_kom(formData);

            toast.success('Contract confirmed successfully');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred while processing the form');
        }
    };

    return (
        <div>
    <form
       onSubmit={handleSubmit}
  >
     <textarea
        name="avvis_kom"
        className="mt-4 h-24 w-96 text-black"
        placeholder="Skriv en begrunnelse"
        ></textarea>
        <input type="hidden" name="id" value={contractId} />
        <br></br>
        <button type="submit" disabled={isSubmitting} className="mt-4 bg-white text-black px-4 py-2">
        {isSubmitting ? 'Sender...' : 'Send inn'}
        </button>
       </form>
  </div>
    );
};

export default Avvis_kom;