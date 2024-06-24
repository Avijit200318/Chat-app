import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Privateroute from './components/Privateroute'
import Profile from './pages/Profile'
import OthersPofile from './pages/OthersPofile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Privateroute />}>
          <Route path='/' element={<Home />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/userProfile/:userId' element={<OthersPofile />} />
        </Route>
        <Route path='sign-in' element={<SignIn />} />
        <Route path='sign-up' element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}
