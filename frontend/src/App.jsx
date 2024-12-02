import React from 'react'
import CodeEditor from './components/CodeEditor/CodeEditor.jsx'
import { Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
// import Home from './components/Home'
// import Navbar from './components/Navbar.jsx'
// import Main from './components/Main.jsx'
import Home from './components/Home.jsx'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/editor/:id' element={<CodeEditor />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </div>
  )
}

export default App
