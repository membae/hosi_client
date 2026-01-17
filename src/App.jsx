import React from 'react'
import {Route,Routes} from 'react-router-dom'
import Signup  from './pages/Signup'
import Login from './pages/Login'
import ManageUsers from './components/admin/ManageUsers'
import ManagePatients from './components/admin/ManagePatients'
import ManageAppointments from './components/admin/ManageAppointments'
import AdminSideBar from './components/AdminSideBar'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './components/admin/Dashboard'
import Reports from './components/admin/Reports'


function App() {
  return (
    <Routes>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/' element={<Login/>}></Route>
      <Route path='/manageUsers' element={<AdminLayout><ManageUsers/></AdminLayout>}></Route>
      <Route path='/managepatients' element={<AdminLayout><ManagePatients/></AdminLayout>}></Route>
      <Route path='/manageappointments' element={<AdminLayout><ManageAppointments/></AdminLayout>}></Route>
      <Route path='/adminsidebar' element={<AdminSideBar/>}></Route>
      <Route path='/dashboard' element={<AdminLayout><Dashboard/></AdminLayout>}></Route>
      <Route path='/reports' element={<AdminLayout><Reports/></AdminLayout>}></Route>
    </Routes>
  )
}

export default App