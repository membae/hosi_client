import React, { useEffect, useState } from 'react'
import axios from 'axios'

function ManageAppointments() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const APPOINTMENTS_PER_PAGE = 5

  const [editingAppointment, setEditingAppointment] = useState(null)
  const [formData, setFormData] = useState({
    appointment_datetime: '',
    status: '',
    reason: '',
    patient_id: '',
    user_id: ''
  })

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      setLoading(true)

      const [appRes, patientRes, doctorRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/appointment'),
        axios.get('http://127.0.0.1:5000/patients'),
        axios.get('http://127.0.0.1:5000/users')
      ])

      // 🔒 Force arrays (CRITICAL)
      const appointmentsData = Array.isArray(appRes.data)
        ? appRes.data
        : []

      const patientsData = Array.isArray(patientRes.data)
        ? patientRes.data
        : []

      const doctorsData = Array.isArray(doctorRes.data)
        ? doctorRes.data
        : []

      const enrichedAppointments = appointmentsData.map(a => {
        const patient = patientsData.find(p => p.id === a.patient_id)
        const doctor = doctorsData.find(d => d.id === a.user_id)

        return {
          ...a,
          patient_name: patient
            ? `${patient.first_name} ${patient.last_name}`
            : 'Unknown Patient',
          doctor_name: doctor
            ? `${doctor.first_name} ${doctor.last_name}`
            : 'Unknown Doctor'
        }
      })

      setAppointments(enrichedAppointments)
      setPatients(patientsData)
      setDoctors(doctorsData)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* ================= FORM ================= */
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const saveAppointment = async e => {
    e.preventDefault()

    if (!formData.appointment_datetime) {
      alert('Select appointment date & time')
      return
    }

    try {
      const payload = {
        ...formData,
        appointment_datetime: new Date(
          formData.appointment_datetime
        ).toISOString()
      }

      if (editingAppointment) {
        await axios.patch(
          `http://127.0.0.1:5000/appointment/${editingAppointment.id}`,
          payload
        )
        setEditingAppointment(null)
      } else {
        await axios.post(
          'http://127.0.0.1:5000/appointment',
          payload
        )
      }

      setFormData({
        appointment_datetime: '',
        status: '',
        reason: '',
        patient_id: '',
        user_id: ''
      })

      fetchData()
    } catch (err) {
      console.error(err)
      alert('Failed to save appointment')
    }
  }

  const startEdit = appointment => {
    setEditingAppointment(appointment)
    setFormData({
      appointment_datetime: appointment.appointment_datetime
        ? appointment.appointment_datetime.slice(0, 16)
        : '',
      status: appointment.status || '',
      reason: appointment.reason || '',
      patient_id: appointment.patient_id || '',
      user_id: appointment.user_id || ''
    })
  }

  const deleteAppointment = async id => {
    if (!window.confirm('Delete this appointment?')) return
    await axios.delete(`http://127.0.0.1:5000/appointment/${id}`)
    fetchData()
  }

  /* ================= FILTER ================= */
  const filteredAppointments = appointments.filter(a => {
    const matchesSearch =
      search === '' ||
      a.reason?.toLowerCase().includes(search.toLowerCase()) ||
      a.status?.toLowerCase().includes(search.toLowerCase()) ||
      a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === '' || a.status === statusFilter

    const matchesDate =
      dateFilter === '' ||
      a.appointment_datetime?.slice(0, 10) === dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * APPOINTMENTS_PER_PAGE
  const currentAppointments = filteredAppointments.slice(
    indexOfLast - APPOINTMENTS_PER_PAGE,
    indexOfLast
  )
  const totalPages = Math.ceil(
    filteredAppointments.length / APPOINTMENTS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, dateFilter])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Appointments</h1>

      {/* FORM */}
      <form
        onSubmit={saveAppointment}
        className="grid grid-cols-2 gap-4 mb-6 border p-4 rounded"
      >
        <input
          type="datetime-local"
          name="appointment_datetime"
          value={formData.appointment_datetime}
          onChange={handleChange}
          className="border p-2"
          required
        />

        <input
          name="status"
          placeholder="Status"
          value={formData.status}
          onChange={handleChange}
          className="border p-2"
          required
        />

        <select
          name="patient_id"
          value={formData.patient_id}
          onChange={handleChange}
          className="border p-2"
          required
        >
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>

        <select
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
          className="border p-2"
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>
              {d.first_name} {d.last_name}
            </option>
          ))}
        </select>

        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Enter appointment reason..."
          className="border p-2 col-span-2"
          required
        />

        <button className="col-span-2 bg-green-600 text-white p-2 rounded">
          {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
        </button>
      </form>

      {/* EMPTY STATE */}
      {appointments.length === 0 ? (
        <div className="text-center text-gray-500">
          No appointments yet
        </div>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Reason</th>
              <th className="border p-2">Patient</th>
              <th className="border p-2">Doctor</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.map(a => (
              <tr key={a.id}>
                <td className="border p-2">
                  {a.appointment_datetime
                    ? new Date(a.appointment_datetime).toLocaleString()
                    : '—'}
                </td>
                <td className="border p-2">{a.status}</td>
                <td className="border p-2">{a.reason}</td>
                <td className="border p-2">{a.patient_name}</td>
                <td className="border p-2">{a.doctor_name}</td>
                <td className="border p-2">
                  <button
                    onClick={() => startEdit(a)}
                    className="bg-blue-500 text-white px-2 py-1 mr-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAppointment(a.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ManageAppointments
