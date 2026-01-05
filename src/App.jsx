import React from 'react'
import {Route,Routes} from 'react-router-dom'
import Signup  from './pages/Signup'

function App() {
  return (
    <Routes>
      <Route path='/signup' element={<Signup/>}></Route>
    </Routes>
  )
}

export default App