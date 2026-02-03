type ContractFormInputs = {
        id: string;
        seller: string;
        buyer: string;
        orgnr: string;
        contact: string;
        email: string;
        phone: string;
        address: string;
        input: { name: string; id: string; comment: string; description: string}[];
        total: number;
        comment: string;
        user_email: string | undefined;
        user_phone: string | undefined;
    };