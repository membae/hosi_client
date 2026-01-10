import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AdminSideBar from '../AdminSideBar'

function ManageUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const USERS_PER_PAGE = 5

  // 🔹 Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await axios.get('http://127.0.0.1:5000/users')
      setUsers(Array.isArray(res.data) ? res.data : [])
      setError('')
    } catch (err) {
      console.error(err)
      setUsers([])
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 🔍 Search + Role Filter
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesRole =
      roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // 📄 Pagination
  const indexOfLast = currentPage * USERS_PER_PAGE
  const indexOfFirst = indexOfLast - USERS_PER_PAGE
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, roleFilter])

  // ✏️ Edit handlers
  const handleEditChange = e => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value })
  }

  const saveUser = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:5000/user/${editingUser.id}`,
        {
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          email: editingUser.email,
          role: editingUser.role
        }
      )
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert('Failed to update user')
    }
  }

  // ❌ Delete user
  const deleteUser = async id => {
    if (!window.confirm('Delete this user?')) return
    try {
      await axios.delete(`http://127.0.0.1:5000/user/${id}`)
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert('Failed to delete user')
    }
  }

  if (loading) return <div className="p-6">Loading users...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      {/* 🔍 Filters */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border p-2 w-full"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="border p-2"
        >
          <option value="all">All Roles</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* 📋 Users Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map(user => (
            <tr key={user.id}>
              <td className="border p-2">
                {user.first_name} {user.last_name}
              </td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => setEditingUser(user)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {currentUsers.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📄 Pagination */}
      <div className="mt-4 flex gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ✏️ Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="font-bold mb-4">Edit User</h2>

            <input
              name="first_name"
              value={editingUser.first_name}
              onChange={handleEditChange}
              className="border p-2 w-full mb-2"
            />
            <input
              name="last_name"
              value={editingUser.last_name}
              onChange={handleEditChange}
              className="border p-2 w-full mb-2"
            />
            <input
              name="email"
              value={editingUser.email}
              onChange={handleEditChange}
              className="border p-2 w-full mb-2"
            />

            <select
              name="role"
              value={editingUser.role}
              onChange={handleEditChange}
              className="border p-2 w-full mb-4"
            >
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={saveUser}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageUsers
