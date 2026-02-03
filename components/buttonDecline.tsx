'use client';
import React from 'react';
import { toast } from 'sonner';
import { updateStatus } from "@/app/serverActions/updateStatus";
import { useState } from 'react';

const ContractFormDC = ({ contractId }: { contractId: string }) => {
    const [isVerified, setIsverified] = useState<boolean>(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        try {
            const result = await updateStatus(formData);

            toast.success('Contract confirmed successfully');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred while processing the form');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="hidden" name="status" value="Avvist" />
            <input type="hidden" name="id" value={contractId} />
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="verified"
                    onChange={() => setIsverified(!isVerified)}
                    className="mr-2 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="verified" className="text-gray-200">
                    Jeg ønsker ikke å godkjenne kontrakten.
                </label>
            </div>
            <button disabled={!isVerified} type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                Avvise kontrakt
            </button>
        </form>
    );
};

export default ContractFormDC;