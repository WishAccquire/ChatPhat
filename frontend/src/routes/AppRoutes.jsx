import React from 'react'
import { Route,BrowserRouter,Routes } from 'react-router-dom'
import LoginForm from '../screens/LoginForm'
import Register from '../screens/Register'
import Home from '../screens/Home'

function AppRoutes() {
  return (
    <div>
      <BrowserRouter>

      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<LoginForm/>} />
        <Route path='/register' element={<Register/>} />
      </Routes>
      </BrowserRouter>

    </div>
  )
}

export default AppRoutes
