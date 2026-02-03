import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { BookmarkSquareIcon, BookOpenIcon, QueueListIcon, RssIcon } from '@heroicons/react/24/solid'

export default function NotFound() {
    return (
      <main>
            <div className="bg-gray-900">
            <img
              className="mx-auto h-10 w-auto sm:h-44"
              src="/M.png"
              alt="Your Company"
            />
            <div className="mx-auto mt-20 max-w-2xl text-center sm:mt-24">
              <p className="text-base font-semibold leading-8 text-sky-400">404</p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-200 sm:text-5xl">Denne siden eksisterer ikke</h1>
              <h2 className="mt-4 text-base leading-7 text-gray-100 sm:mt-6 sm:text-lg sm:leading-8">
                Siden du ser etter finnes ikke. Vennligst sjekk om det er riktig nettadresse eller kontakt oss for hjelp. 
              </h2>
            </div>
            <div className="mx-auto mt-16 flow-root max-w-lg sm:mt-20">
              <h2 className="sr-only">Popular pages</h2>
              <ul role="list" className="-mt-6 divide-y divide-gray-900/5 border-b border-gray-900/5">
              </ul>
              <div className="mt-10 flex justify-center">
                <a href="/" className="text-sm font-semibold leading-6 text-sky-400">
                  <span aria-hidden="true">&larr;</span>
                  Tilbake til startsiden
                </a>
              </div>
            </div>
        </div>
      </main>
    )
  }