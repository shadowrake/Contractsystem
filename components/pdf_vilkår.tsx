import {FC} from 'react';

const DownloadPdf: FC = () => {

    return (
        <div>
        <p>Vilkår sist oppdatert: 01/10/2025 @ 14:10</p>
        <a href='/vilkår.pdf' target='_blank'  className="text-blue-400 hover:text-blue-600">
            Les vilkår
        </a>
        </div>
    );
}

export default DownloadPdf;