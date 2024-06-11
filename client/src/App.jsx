import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Privateroute from './components/Privateroute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Privateroute />}>
        <Route path='/' element={<Home />} />
        </Route>
        <Route path='sign-in' element={<SignIn />} />
        <Route path='sign-up' element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}
