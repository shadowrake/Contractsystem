'use client'
import { sendSlett } from '@/app/actions';
import { deleteOrder } from '@/app/serverActions/deleteOrder';
import { useState } from 'react'
import { toast } from 'sonner';

export default function DeleteOrder({ contractId }: { contractId: string }) {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    console.log(contractId)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = await sendSlett(contractId);
        
        setIsSubmitting(true);

        if (result?.success) {
            console.log({ data: result.data });
            toast.success('Melding sendt til kunde');
        } else {
          console.log('Error sending contract:', result?.error);
        }
        
        try {
            const formDataForDelete = new FormData();
            formDataForDelete.append('id', contractId.toString());
            const result = await deleteOrder(formDataForDelete);

        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred');
        }

        
        
    };

    console.log(contractId)

    return (
        <div>
            <div className='flex items-center flex-col pt-5'>
            <p>Hvis kontrakten var sendt feilaktig/ikke relevant bruk slett knappen</p>
            <button className='inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' onClick={() => setShowModal(true)}>Slett</button>
            </div>
            {showModal && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <span className="absolute top-0 right-0 cursor-pointer p-2" onClick={() => setShowModal(false)}>X</span>
                    <form onSubmit={handleSubmit} className="space-y-4 text-black">
                        <input type="hidden" name='id' value={contractId} />
                        <h2 className='text-lg'>Er du sikker at du vil slette denne kontrakten?</h2>
                        <div className="flex justify-end">
                            <button type='submit' disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">{isSubmitting ? "Sletter..." : "Ja"}</button>
                            <button onClick={() => setShowModal(false)} className="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">Nei</button>
                        </div>
                    </form>
                </div>
            </div>
            )}
        </div>
    )
}