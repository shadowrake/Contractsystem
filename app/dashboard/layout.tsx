import { redirect } from 'next/navigation'
import {
  UsersIcon,
  PencilSquareIcon,
  InboxIcon,
  InboxArrowDownIcon,
} from '@heroicons/react/24/outline'

import { createClient } from '@/utils/supabase/server'
import SignoutBtn from '@/components/signoutBtn'



const navigation = [
  { name: 'Mine kontrakter', href: '/dashboard', icon: InboxIcon, current: false },
  { name: 'Mine utkast', href: '/dashboard/draft', icon: PencilSquareIcon, current: false },
]
const navigationAdmin = [
  { name: 'Mine kontrakter', href: '/dashboard', icon: InboxIcon, current: false },
  { name: 'Mine utkast', href: '/dashboard/draft', icon: PencilSquareIcon, current: false },
  { name: 'Admin', href: '/dashboard/admin', icon: UsersIcon, current: false },
  { name: 'Admin utkast', href: '/dashboard/admin/draft', icon: InboxArrowDownIcon, current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default async function dashboardLayout ({ children }: { children: React.ReactNode })  {
    const supabase = createClient()
    const { data: {user}, error } = await supabase.auth.getUser()
    if (error || !user?.id) {
        redirect('/')
    }


    const { data: userAcc } = await supabase.from('profiles').select().eq('id', user.id)

  return (
    <>
      <div className='text-white bg-black'>
        {/* Static sidebar for desktop */}
        <div className="xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 ring-1 ring-white/5">
            <div className="flex h-16 shrink-0 items-center">
              <p></p>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {userAcc?.map((userAcc: Users) => (
                    <div key={userAcc.id}>
                    {userAcc.role === 'admin' ? (
                    <div>
                    {navigationAdmin.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </a>
                      </li>
                    ))}
                    </div>
                    ) : (<div>
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                            )}
                          >
                            <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                            {item.name}
                          </a>
                        </li>
                      ))}
                      </div>)}
                    </div>
                    ))}
                  </ul>
                </li>
                {userAcc?.map((userAcc: Users) => (
                <li key={userAcc.id} className="-mx-6 mt-auto">
                    <span className="sr-only">Your profile</span>
                    <span className='mx-1' aria-hidden="true">{userAcc.first_name} {userAcc.last_name} | Rolle: {userAcc.role}</span>
                  <form method="POST" className='flex justify-end mr-1 mb-1'> 
                    <SignoutBtn />
                    </form>
                </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        <div className="xl:pl-72"> 
            {children}
        </div>
      </div>
    </>
  )
}
