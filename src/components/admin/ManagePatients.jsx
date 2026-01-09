import React, { useEffect, useState } from 'react'
import axios from 'axios'

function ManagePatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  // ✏️ Handle form input
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // ➕ Create patient
  const createPatient = async e => {
    e.preventDefault()
    try {
      await axios.post('http://127.0.0.1:5000/patients', {
        ...formData,
        admitted_at: new Date(formData.admitted_at).toISOString(),
        discharged_at: new Date(formData.discharged_at).toISOString()
      })
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
      alert('Failed to create patient')
    }
  }

  if (loading) return <div className="p-6">Loading patients...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Patients</h1>

      {/* ➕ Create Patient */}
      <form onSubmit={createPatient} className="grid grid-cols-2 gap-4 mb-6">
        <input
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          name="status"
          placeholder="Status (admitted / discharged)"
          value={formData.status}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          name="diagnosis"
          placeholder="Diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          className="border p-2 col-span-2"
          required
        />
        <textarea
          name="doctor_summary"
          placeholder="Doctor Summary"
          value={formData.doctor_summary}
          onChange={handleChange}
          className="border p-2 col-span-2"
          required
        />
        <input
          type="datetime-local"
          name="admitted_at"
          value={formData.admitted_at}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          type="datetime-local"
          name="discharged_at"
          value={formData.discharged_at}
          onChange={handleChange}
          className="border p-2"
          required
        />

        <button className="bg-green-600 text-white p-2 col-span-2 rounded">
          Add Patient
        </button>
      </form>

      {/* 📋 Patients Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Diagnosis</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td className="border p-2">
                {patient.first_name} {patient.last_name}
              </td>
              <td className="border p-2">{patient.phone_number}</td>
              <td className="border p-2">{patient.status}</td>
              <td className="border p-2">{patient.diagnosis}</td>
            </tr>
          ))}

          {patients.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No patients found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ManagePatients
