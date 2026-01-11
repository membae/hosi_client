import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';

function FullAnalyticsDashboard() {
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsRes, usersRes, appointmentsRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/patients'),
        axios.get('http://127.0.0.1:5000/users'),
        axios.get('http://127.0.0.1:5000/appointment')
      ]);

      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      setError('');
    } catch (err) {
      console.error(err);
      setPatients([]);
      setUsers([]);
      setAppointments([]);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FILTER BY DATE ================= */
  const filteredAppointments = appointments.filter(a => {
    if (!startDate && !endDate) return true;
    const appDate = new Date(a.appointment_datetime);
    if (startDate && appDate < new Date(startDate)) return false;
    if (endDate && appDate > new Date(endDate)) return false;
    return true;
  });

  const filteredPatients = patients.filter(p => {
    if (!startDate && !endDate) return true;
    const pDate = new Date(p.created_at || p.admission_date); // adapt to your patient date field
    if (startDate && pDate < new Date(startDate)) return false;
    if (endDate && pDate > new Date(endDate)) return false;
    return true;
  });

  /* ================= AGGREGATES ================= */
  const totalPatients = filteredPatients.length;
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalAppointments = filteredAppointments.length;

  // Patient status distribution
  const patientStatusCounts = filteredPatients.reduce((acc, p) => {
    const status = p.status || 'unknown'; // healed / deceased / ongoing
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const healingRate = patientStatusCounts.healed
    ? ((patientStatusCounts.healed / totalPatients) * 100).toFixed(1)
    : 0;

  const mortalityRate = patientStatusCounts.deceased
    ? ((patientStatusCounts.deceased / totalPatients) * 100).toFixed(1)
    : 0;

  // Appointments by status
  const appointmentsByStatus = filteredAppointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  // Appointments per doctor
  const appointmentsByDoctor = filteredAppointments.reduce((acc, a) => {
    const doctor = a.doctor?.first_name + ' ' + a.doctor?.last_name || 'Unknown';
    acc[doctor] = (acc[doctor] || 0) + 1;
    return acc;
  }, {});

  // Monthly appointment trends
  const monthlyTrends = filteredAppointments.reduce((acc, a) => {
    const month = new Date(a.appointment_datetime).toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  /* Convert for charts */
  const statusData = Object.entries(appointmentsByStatus).map(([name, value]) => ({ name, value }));
  const doctorData = Object.entries(appointmentsByDoctor).map(([name, value]) => ({ name, value }));
  const patientStatusData = Object.entries(patientStatusCounts).map(([name, value]) => ({ name, value }));
  const monthlyData = Object.entries(monthlyTrends).map(([month, value]) => ({ month, value }));

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Hospital Analytics Dashboard</h1>

      {/* ===== Date Range Filter ===== */}
      <div className="flex gap-4 mb-6">
        <div>
          <label>Start Date:</label>
          <input type="date" className="border p-2 ml-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date:</label>
          <input type="date" className="border p-2 ml-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded shadow">
          <h2>Total Patients</h2>
          <p className="text-2xl font-bold">{totalPatients}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded shadow">
          <h2>Total Doctors</h2>
          <p className="text-2xl font-bold">{totalDoctors}</p>
        </div>
        <div className="bg-purple-500 text-white p-4 rounded shadow">
          <h2>Total Appointments</h2>
          <p className="text-2xl font-bold">{totalAppointments}</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded shadow">
          <h2>Healing / Mortality</h2>
          <p className="text-lg">{healingRate}% healed</p>
          <p className="text-lg">{mortalityRate}% deceased</p>
        </div>
      </div>

      {/* ===== Charts ===== */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Patient Status</h3>
          <PieChart width={300} height={300}>
            <Pie data={patientStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
              {patientStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Appointments by Status</h3>
          <PieChart width={300} height={300}>
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Appointments per Doctor</h3>
          <BarChart width={400} height={300} data={doctorData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Monthly Appointment Trends</h3>
          <LineChart width={400} height={300} data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#82ca9d" />
          </LineChart>
        </div>
      </div>
    </div>
  );
}

export default FullAnalyticsDashboard;
