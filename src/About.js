import React from 'react'
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { openDB } from 'idb';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export default function About() {
    const [data, setData] = useState([])
    const [mode, setMode] = useState('online');
    const [show, setShow] = useState(true);
    const [originalData, setOriginalData] = useState([]);
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://backend-movie-8ay7.onrender.com/peli'); // Replace with your API endpoint
                const result = await response.json();
                setData(result);
                setOriginalData(result);
                setMode('online');

                const db = await openDB('myDatabase', 1, {
                    upgrade(db) {
                        const objectStore = db.createObjectStore('peliculas', { keyPath: 'id' });
                        result.forEach(pelicula => {
                            objectStore.add(pelicula);
                        });
                    },
                });
            } catch (error) {
                setMode('offline');
                const db = await openDB('myDatabase', 1);
                const transaction = db.transaction('peliculas', 'readonly');
                const objectStore = transaction.objectStore('peliculas');
                const offlineData = await objectStore.getAll();
                setData(offlineData);
                setOriginalData(offlineData);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        const titulo = event.target.elements.titulo.value.toLowerCase();
        const genero = event.target.elements.genero.value.toLowerCase();
        const anio = event.target.elements.anio.value;

        if (mode === 'online') {
            const searchResults = originalData.filter(pelicula => {
                return (
                    pelicula.titulo.toLowerCase().includes(titulo) &&
                    pelicula.genero.toLowerCase().includes(genero) &&
                    pelicula.anio.toString().includes(anio)
                );
            });
            setData(searchResults);
        } else if (mode === 'offline') {
            const searchResults = originalData.filter(pelicula => {
                return (
                    pelicula.titulo.toLowerCase().includes(titulo) &&
                    pelicula.genero.toLowerCase().includes(genero) &&
                    pelicula.anio.toString().includes(anio)
                );
            });
            setData(searchResults);
        }
    };
    
    return (
        <div>
            <h1>Buscar Películas</h1>
            <br></br>
            <div>
                {mode === 'offline' ?
                    <Alert variant="warning" onClose={() => setShow(false)} dismissible>
                        <Alert.Heading>You are in offline mode or some issue with connection</Alert.Heading>
                        <p>Se encuentra modo sin conexión</p>
                    </Alert> : null
                }
            </div>
            <Form id="searchForm" onSubmit={handleSearch}>
                <Form.Group className="mb-3">
                    <Form.Label>Título de la Película</Form.Label>
                    <Form.Control type="text" name="titulo" autoComplete="on" minLength="3" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Género</Form.Label>
                    <Form.Control type="text" name="genero" autoComplete="on" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Año</Form.Label>
                    <Form.Control type="text" name="anio" pattern="[0-9]*" />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Buscar
                </Button>
            </Form>
            <div id="resultadosContainer" className="row mt-4">
                {data.map((pelicula) => (
                    <div className="col-md-3" key={pelicula.id}>
                        <Card style={{ width: '18rem' }}>
                            <Card.Img
                                variant="top"
                                src={pelicula.ruta}
                                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                            />
                            <Card.Body>
                                <Card.Title>{pelicula.titulo}</Card.Title>
                                <Card.Text>{pelicula.sinopsis}</Card.Text>
                                <Card.Text>{pelicula.calificacion}</Card.Text>
                                <Link to={`/pelicula/${pelicula._id}`}>
                                    <Button variant="primary">Ver detalles</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    )
}
