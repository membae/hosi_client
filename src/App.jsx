import React from 'react'
import {Route,Routes} from 'react-router-dom'
import Signup  from './pages/Signup'
import Login from './pages/Login'
import ManageUsers from './components/admin/ManageUsers'

function App() {
  return (
    <Routes>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/manageUsers' element={<ManageUsers/>}></Route>
    </Routes>
  )
}

export default App