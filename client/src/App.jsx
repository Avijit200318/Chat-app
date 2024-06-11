import React from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Home from './components/pages/Home'
import SignIn from './components/pages/SignIn'
import SignUp from './components/pages/SignUp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='sign-in' element={<SignIn />} />
        <Route path='sign-up' element={<SignUp/>} />
      </Routes>
    </BrowserRouter>
  )
}
