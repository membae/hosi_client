import React, { useEffect, useState } from 'react'
import axios from 'axios'

function ManagePatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingPatient, setEditingPatient] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    doctor_summary: '',
    status: '',
    diagnosis: '',
    admitted_at: '',
    discharged_at: ''
  })

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const PATIENTS_PER_PAGE = 5

  // 🔹 Fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await axios.get('http://127.0.0.1:5000/patients')
      setPatients(Array.isArray(res.data) ? res.data : [])
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // Handle form input
  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

  // Add / update patient
  const savePatient = async e => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        admitted_at: new Date(formData.admitted_at).toISOString(),
        discharged_at: new Date(formData.discharged_at).toISOString()
      }

      if (editingPatient) {
        await axios.patch(`http://127.0.0.1:5000/patient/${editingPatient.id}`, payload)
        setEditingPatient(null)
      } else {
        await axios.post('http://127.0.0.1:5000/patients', payload)
      }

      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        doctor_summary: '',
        status: '',
        diagnosis: '',
        admitted_at: '',
        discharged_at: ''
      })
      fetchPatients()
    } catch (err) {
      console.error(err)
      alert('Failed to save patient')
    }
  }

  // Start editing
  const startEdit = patient => {
    setEditingPatient(patient)
    setFormData({
      ...patient,
      admitted_at: patient.admitted_at?.slice(0, 16),
      discharged_at: patient.discharged_at?.slice(0, 16)
    })
  }

  // Delete patient
  const deletePatient = async id => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return
    try {
      await axios.delete(`http://127.0.0.1:5000/patient/${id}`)
      fetchPatients()
    } catch (err) {
      console.error(err)
      alert('Failed to delete patient')
    }
  }

  // Filter and search
  const filteredPatients = patients.filter(p => {
    const searchText = `${p.first_name} ${p.last_name} ${p.phone_number} ${p.diagnosis}`.toLowerCase()
    const matchesSearch = searchText.includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.status.toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  // Pagination
  const indexOfLast = currentPage * PATIENTS_PER_PAGE
  const indexOfFirst = indexOfLast - PATIENTS_PER_PAGE
  const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE)

  // Reset page when search or filter changes
  useEffect(() => setCurrentPage(1), [search, filterStatus])

  if (loading) return <div className="p-6">Loading patients...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Patients</h1>

      {/* ➕ / ✏️ Add/Edit Form */}
      <form onSubmit={savePatient} className="grid grid-cols-2 gap-4 mb-6 border p-4 rounded">
        <h2 className="col-span-2 text-xl font-semibold">{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h2>
        <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" className="border p-2" required />
        <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" className="border p-2" required />
        <input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" className="border p-2" required />
        <input name="status" value={formData.status} onChange={handleChange} placeholder="Status" className="border p-2" required />
        <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="Diagnosis" className="border p-2 col-span-2" required />
        <textarea name="doctor_summary" value={formData.doctor_summary} onChange={handleChange} placeholder="Doctor Summary" className="border p-2 col-span-2" required />
        <input type="datetime-local" name="admitted_at" value={formData.admitted_at} onChange={handleChange} className="border p-2" required />
        <input type="datetime-local" name="discharged_at" value={formData.discharged_at} onChange={handleChange} className="border p-2" required />
        <button className={`col-span-2 p-2 rounded text-white ${editingPatient ? 'bg-blue-600' : 'bg-green-600'}`}>
          {editingPatient ? 'Update Patient' : 'Add Patient'}
        </button>
      </form>

      {/* 🔍 Search & Filter */}
      <div className="flex gap-4 mb-4 items-center">
        <input type="text" placeholder="Search by name, phone, or diagnosis" value={search} onChange={e => setSearch(e.target.value)} className="border p-2 flex-1" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border p-2">
          <option value="all">All Status</option>
          <option value="admitted">Admitted</option>
          <option value="discharged">Discharged</option>
        </select>
      </div>

      {/* 📋 Patients Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Diagnosis</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPatients.map(p => (
            <tr key={p.id}>
              <td className="border p-2">{p.first_name} {p.last_name}</td>
              <td className="border p-2">{p.phone_number}</td>
              <td className="border p-2">{p.status}</td>
              <td className="border p-2">{p.diagnosis}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => startEdit(p)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => deletePatient(p.id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
          {currentPatients.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4">No patients found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔢 Pagination */}
      <div className="mt-4 flex gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ManagePatients
