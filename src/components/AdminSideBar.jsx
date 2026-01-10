import React from 'react'
import { Link } from 'react-router-dom'
import { House, Users, Calendar, FileText, UserCog } from 'lucide-react'

function AdminSideBar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
      
      {/* Logo */}
      <div className="text-2xl font-bold mb-8 text-center">
        Admin Panel
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition"
        >
          <House size={18} /> Dashboard
        </Link>

        <Link
          to="/managepatients"
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition"
        >
          <Users size={18} /> Patients
        </Link>

        <Link
          to="/manageappointments"
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition"
        >
          <Calendar size={18} /> Appointments
        </Link>

        <Link
          to="/manageusers"
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition"
        >
          <UserCog size={18} /> Users
        </Link>

        <Link
          to="/reports"
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition"
        >
          <FileText size={18} /> Reports
        </Link>
      </nav>

      {/* Footer – sticks to bottom */}
      <div className="mt-auto pt-4 border-t border-gray-700 text-sm text-gray-400 text-center">
        &copy; 2026 Hospital Management
      </div>
    </div>
  )
}

export default AdminSideBar
