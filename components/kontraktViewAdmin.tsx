"use client";
import {useState, useEffect} from 'react';

interface Contract {
  id: number;
  seller: string;
  buyer: string;
  status: string;
  environment: string;
}

const statuses = {
  underReview: 'text-yellow-400 bg-gray-100/10',
  Godkjent: 'text-green-400 bg-green-400/10',
  Avvist: 'text-red-600 bg-rose-400/10',
}
const environments = {
  View: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
}
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
} 

export default function KontraktViewAdmin({ contracts }: { contracts: Contract[] }) {

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  useEffect(() => {
    const savedStatusFilter = localStorage.getItem('statusFilter')
    const savedSearchTerm = localStorage.getItem('searchTerm')
    
    if (savedStatusFilter) {
      setStatusFilter(savedStatusFilter)
    }
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm)
    }
  }, [])

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    localStorage.setItem('statusFilter', status)
  }

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term)
    localStorage.setItem('searchTerm', term)
  }
  
  const filteredContracts = contracts?.filter((contract: Contract) => {
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    const matchesSearch = searchTerm === '' || 
    contract.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.buyer.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })
  
  return (
    <div className="space-y-4 my-4">
      <div className="px-4 sm:px-6 lg:px-8">
      <input
        type="text"
        placeholder="Søk etter selger eller kunde"
        value={searchTerm}
        onChange={(e) => handleSearchTermChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
      />
      </div>
      
      <div className="flex gap-2 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => handleStatusFilterChange('all')}
        className={`px-3 py-1 text-xs rounded-full ${
        statusFilter === 'all' 
          ? 'bg-white text-black' 
          : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        Vis alle
      </button>
      <button
        onClick={() => handleStatusFilterChange('Godkjent')}
        className={`px-3 py-1 text-xs rounded-full ${
        statusFilter === 'Godkjent' 
          ? 'bg-green-400 text-black' 
          : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        Godkjent
      </button>
      <button
        onClick={() => handleStatusFilterChange('Avvist')}
        className={`px-3 py-1 text-xs rounded-full ${
        statusFilter === 'Avvist' 
          ? 'bg-red-400 text-black' 
          : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        Avvist
      </button>
      <button
        onClick={() => handleStatusFilterChange('underReview')}
        className={`px-3 py-1 text-xs rounded-full ${
        statusFilter === 'underReview' 
          ? 'bg-yellow-400 text-black' 
          : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        Under vurdering
      </button>
      </div>

      { filteredContracts?.length === 0 ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <p className="text-gray-400">Ingen kontrakter funnet.</p>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-white/5">
          {filteredContracts?.map((contracts: Contract, index: number) => (
            <li key={contracts.id} className="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="min-w-0 flex-auto">
                <div className="flex items-center gap-x-3">
        <div className={classNames(statuses[contracts.status as keyof typeof statuses], 'flex-none rounded-full p-1')}>
          <div className="h-2 w-2 rounded-full bg-current" />
        </div>
        <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
          
          <span className="truncate">#{index + 1} {contracts.seller}</span>
          <span className="text-gray-400">/</span>
          <span className="whitespace-nowrap">{contracts.buyer}</span>
        </h2>
        </div>
        <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
          <p className="truncate"></p>
        </div>
        </div>

        <a href={`/dashboard/admin/contracts/${contracts.id}`}>
        <div
        className={classNames(
          environments[contracts.environment as keyof typeof environments],
          'rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset'
        )}
        >
        {contracts.environment}
        </div>
        </a>
      </li>
      ))}
      </ul>
      )}
    </div>
  );
};
