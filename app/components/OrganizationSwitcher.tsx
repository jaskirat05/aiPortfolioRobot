'use client'

import { useOrganizationList } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'


export const CustomOrganizationSwitcher = () => {

  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })
  if (userMemberships.data?.length === 0){
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not a memeber of any organization yet, please ask admin to invite you to the respective organization</p>
      </div>
    )
  }
  const router = useRouter()

  const handleOrganizationSelect = async (organizationId: string, organizationName: string) => {
    await setActive!({ organization: organizationId })
    router.push(`/organization/${organizationName.toLowerCase().replace(/\s+/g, '-')}`)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">Select Organization</h1>
        
        <div className="grid gap-4">
          {userMemberships.data?.map((mem) => (
            <div 
              key={mem.id}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-6 flex items-center justify-between group hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                {mem.organization.imageUrl ? (
                  <img 
                    src={mem.organization.imageUrl} 
                    alt={mem.organization.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-xl font-semibold">
                      {mem.organization.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{mem.organization.name}</h3>
                  
                </div>
              </div>
              
              <button 
                onClick={() => handleOrganizationSelect(mem.organization.id, mem.organization.slug!)}
                className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors duration-200 text-sm font-medium"
              >
                Select
              </button>
            </div>
          ))}
        </div>

        {userMemberships.hasNextPage && (
          <button 
            onClick={() => userMemberships.fetchNext()}
            className="mt-6 w-full py-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors duration-200 text-sm font-medium"
          >
            Load More Organizations
          </button>
        )}
        
        {userMemberships.data?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Organizations Found</h3>
            <p className="text-gray-400">You are not a member of any organizations yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}