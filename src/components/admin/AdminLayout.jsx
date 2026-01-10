// src/components/AdminLayout.jsx
import React from 'react'
import AdminSideBar from '../AdminSideBar'

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <AdminSideBar />
      </div>

      {/* Page content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default AdminLayout
