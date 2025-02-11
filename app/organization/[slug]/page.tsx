import {auth} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiGrid, FiUsers, FiSettings, FiBell, FiCalendar } from "react-icons/fi";

export default async function ProjectPage({params}:{params:{slug:string}}){
  const {slug}=await params
  const {orgSlug}=await auth()
  
  if (slug!=orgSlug){
    redirect(`/clients`)
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-4 gap-8 h-screen p-8">
        {/* Projects Tile - Takes up 2 columns and 2 rows */}
        <Link href={`/organization/${slug}/projects`} 
          className="col-span-2 row-span-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-10 transition-transform hover:scale-[1.01] hover:shadow-xl">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <FiGrid className="w-10 h-10 text-white" />
              <h2 className="text-3xl font-bold text-white">Projects</h2>
            </div>
            <p className="text-purple-100 text-lg mb-6">Manage and monitor all your organization's projects in one place</p>
            <div className="mt-auto">
              <span className="text-white/80 text-base">Click to view all projects →</span>
            </div>
          </div>
        </Link>

        {/* Updates Tile */}
        <Link href={`/organization/${slug}/updates`}
          className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg p-8 transition-transform hover:scale-[1.01] hover:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <FiBell className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Updates</h2>
          </div>
          <p className="text-orange-100 text-base">Stay informed with latest updates</p>
        </Link>

        {/* Members Tile */}
        <Link href={`/organization/${slug}/members`}
          className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg p-8 transition-transform hover:scale-[1.01] hover:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <FiUsers className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Members</h2>
          </div>
          <p className="text-emerald-100 text-base">Manage team members and roles</p>
        </Link>

        {/* Settings Tile */}
        <Link href={`/organization/${slug}/settings`}
          className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg p-8 transition-transform hover:scale-[1.01] hover:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <FiSettings className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <p className="text-blue-100 text-base">Configure organization preferences</p>
        </Link>

        {/* Book Appointment Tile */}
        <Link href={`/organization/${slug}/appointments`}
          className="col-span-2 bg-gradient-to-br from-rose-400 to-red-500 rounded-lg p-8 transition-transform hover:scale-[1.01] hover:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <FiCalendar className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Book an Appointment</h2>
          </div>
          <p className="text-rose-100 text-base">Schedule meetings and consultations with team members</p>
        </Link>
      </div>
    </div>
  )
}
