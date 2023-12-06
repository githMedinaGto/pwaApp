//import logo from './logo.svg';
import './App.css';
import { Navbar, Container, Nav } from 'react-bootstrap'
import Home from './Home'
import About from './About'
import Users from './Users'
import Pelicula from './Pelicula'
import Perfil from './Perfil'
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Alert from 'react-bootstrap/Alert';
import React, { useState, useEffect } from 'react'


function App() {
  const [data, setData] = useState([])
  const [mode, setMode] = useState('online');
  const [show, setShow] = useState(true);

  React.useEffect(() => {
    // const msg=firebase.messaging();
    // msg.requestPermission().then(()=>{
    //   return msg.getToken();
    // }).then((data)=>{
    //   console.warn("token",data)
    // })
  })

  

  return (
    <div className="App">
      <Router>
        <Navbar bg="primary" data-bs-theme="dark">
          <Container>
            <Navbar.Brand href="/">CineMania</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link><Link to="/" >Home</Link></Nav.Link>
              <Nav.Link><Link to="/buscar">Buscar</Link></Nav.Link>
              <Nav.Link><Link to="/perfil">Perfil</Link></Nav.Link>
            </Nav>
          </Container>
        </Navbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<About />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/pelicula/:id" element={<Pelicula />} />
        </Routes>
      </Router>

      <div>
        {
          mode === 'offline' ?
            <Alert variant="warning" onClose={() => setShow(false)} dismissible>
              <Alert.Heading>You are in offline mode or some issue with connection</Alert.Heading>
              <p>
                Se encuentramodo sin conexion
              </p>
            </Alert> : null
        }
      </div>

      
    </div>
  );
}

export default App;
