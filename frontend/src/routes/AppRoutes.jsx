import React from 'react'
import { Route,BrowserRouter,Routes } from 'react-router-dom'
import LoginForm from '../screens/LoginForm'
import Register from '../screens/Register'
import Home from '../screens/Home'
import Project from '../screens/Project'
import UserAuth from '../auth/UserAuth'


function AppRoutes() {
  return (
    <div>
      <BrowserRouter>

      <Routes>
        <Route path='/' element={<UserAuth><Home/></UserAuth>} />
        <Route path='/login' element={<LoginForm/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/project' element={<UserAuth><Project /></UserAuth>} />

      </Routes>
      </BrowserRouter>

    </div>
  )
}

export default AppRoutes
