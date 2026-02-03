'use client';
import React from 'react';
import { toast } from 'sonner';
import { updateStatus } from "@/app/serverActions/updateStatus";
import { useState } from 'react';
import { sendAvvis, sendGodkjennelse } from '@/app/actions'
import DownloadPdf from './pdf_vilkår';

const ContractForm = ({ contractId }: { contractId: string }) => {
    const [isVerified, setIsverified] = useState<boolean>(false);
    const [isVerified2, setIsVerified2] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        
        setIsSubmitting(true);

        if(formData.get('status') === 'Godkjent'){
            const result = await sendGodkjennelse(contractId);
        } else{
            const result = await sendAvvis(contractId);
        }

        try {
            const result = await updateStatus(formData);

            toast.success('Contract confirmed successfully');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred while processing the form');
        }
    };

    return (
        <div>
        <form onSubmit={handleSubmit}>
            <input type="hidden" name="status" value="Godkjent" />
            <input type="hidden" name="id" value={contractId} />
            <DownloadPdf />
            <br />
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="verified"
                    onChange={() => setIsverified(!isVerified)}
                    className="mr-2 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="verified" className="text-gray-200">
                    Ja, jeg har lest og godtar vilkårene. 
                </label>
            </div>
            <button disabled={!isVerified || isSubmitting} type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                {isSubmitting ? 'Sender...' : 'Godkjenn kontrakt'}
            </button>
        </form>
        <br />
        <form onSubmit={handleSubmit}>
        <input type="hidden" name="status" value="Avvist" />
        <input type="hidden" name="id" value={contractId} />
        <div className="flex items-center">
            <input
                type="checkbox"
                id="verified2"
                onChange={() => setIsVerified2(!isVerified2)}
                className="mr-2 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="verified2" className="text-gray-200">
                Jeg ønsker ikke å godkjenne kontrakten.
            </label>
        </div>
        <button disabled={!isVerified2 || isSubmitting} type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            {isSubmitting ? 'Sender...' : 'Avvise kontrakt'}
        </button>
    </form>
    </div>
    );
};

export default ContractForm;