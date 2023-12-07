import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { openDB } from 'idb';
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';


export default function Home() {
    const [data, setData] = useState([])
    const [mode, setMode] = useState('online');
    const [show, setShow] = useState(true);

    useEffect(() => {
        
        let url = "https://backend-movie-8ay7.onrender.com/peli";

        fetch(url)
            .then((response) => {
                response.json()
                    .then((result) => {
                        setData(result);
                        // Aquí es donde puedes almacenar los datos en IndexedDB en lugar de localStorage
                        // Código para almacenar en IndexedDB
                        const request = window.indexedDB.open('myDatabase', 1);
                        const requestPel = window.indexedDB.open('myDatabasePelicula', 1);

                        request.onerror = function (event) {
                            console.log('Error al abrir la base de datos', event);
                        };

                        request.onupgradeneeded = function (event) {
                            const db = event.target.result;
                            const objectStore = db.createObjectStore('peliculas', { keyPath: '_id' });
                            objectStore.transaction.oncomplete = function (event) {
                                const peliculasObjectStore = db.transaction('peliculas', 'readwrite').objectStore('peliculas');
                                result.forEach(function (pelicula) {
                                    peliculasObjectStore.add(pelicula);
                                });
                            };
                        };

                        requestPel.onupgradeneeded = function (event) {
                            const db = event.target.result;
                            const objectStore = db.createObjectStore('peliculas', { keyPath: '_id' });
                            objectStore.transaction.oncomplete = function (event) {
                                const peliculasObjectStore = db.transaction('peliculas', 'readwrite').objectStore('peliculas');
                                result.forEach(function (pelicula) {
                                    peliculasObjectStore.add(pelicula);
                                });
                            };
                        };
                    });
            })
            .catch(err => {
                setMode('offline');
                // Recuperar los datos de IndexedDB en modo offline
                const request = window.indexedDB.open('myDatabase', 1);

                request.onsuccess = function (event) {
                    const db = event.target.result;
                    const transaction = db.transaction(['peliculas'], 'readonly');
                    const objectStore = transaction.objectStore('peliculas');
                    const getRequest = objectStore.getAll();

                    getRequest.onsuccess = function (event) {
                        setData(event.target.result);
                    };
                };
            });


            let urlUser = "https://backend-movie-8ay7.onrender.com/user";

            fetch(urlUser)
                .then((response) => {
                    response.json()
                        .then((result) => {
                            setData(result);
                            const request = window.indexedDB.open('dbUsers', 1);
                            const requestUser = window.indexedDB.open('myDatabasePerfil', 1);
    
                            request.onerror = function (event) {
                                console.log('Error al abrir la base de datos', event);
                            };
    
                            request.onupgradeneeded = function (event) {
                                const db = event.target.result;
                                const objectStore = db.createObjectStore('usuarios', { keyPath: '_id' });
                                objectStore.transaction.oncomplete = function (event) {
                                    const peliculasObjectStore = db.transaction('usuarios', 'readwrite').objectStore('usuarios');
                                    result.forEach(function (usuario) {
                                        peliculasObjectStore.add(usuario);
                                    });
                                };
                            };
                            
                            requestUser.onupgradeneeded = function (event) {
                                const db = event.target.result;
                                const objectStore = db.createObjectStore('usuarios', { keyPath: '_id' });
                                objectStore.transaction.oncomplete = function (event) {
                                    const peliculasObjectStore = db.transaction('usuarios', 'readwrite').objectStore('usuarios');
                                    result.forEach(function (usuario) {
                                        peliculasObjectStore.add(usuario);
                                    });
                                };
                            };

                        });
                })
                .catch(err => {
                    setMode('offline');
                    const request = window.indexedDB.open('dbUsers', 1);
    
                    request.onerror = function (event) {
                        console.log('Error al abrir la base de datos', event);
                    };
    
                    request.onsuccess = function (event) {
                        const db = event.target.result;
                        const transaction = db.transaction(['usuarios'], 'readonly');
                        const objectStore = transaction.objectStore('usuarios');
                        const getRequest = objectStore.getAll();
    
                        getRequest.onsuccess = function (event) {
                            setData(event.target.result);
                        };
                    };
                });



                let urlComentarios = 'https://backend-movie-8ay7.onrender.com/comentarios';

            fetch(urlComentarios)
                .then((response) => {
                    response.json()
                        .then((result) => {
                            setData(result);
                            const request = window.indexedDB.open('myDatabaseComentario', 1);
    
                            request.onerror = function (event) {
                                console.log('Error al abrir la base de datos', event);
                            };
    
                            request.onupgradeneeded = function (event) {
                                const db = event.target.result;
                                const objectStore = db.createObjectStore('comentarios', { keyPath: '_id' });
                                objectStore.transaction.oncomplete = function (event) {
                                    const peliculasObjectStore = db.transaction('comentarios', 'readwrite').objectStore('comentarios');
                                    result.forEach(function (usuario) {
                                        peliculasObjectStore.add(usuario);
                                    });
                                };
                            };
                            
                        });
                })
                .catch(err => {
                    setMode('offline');
                });
    }, []);

    /*useEffect(() => {
        let urlUsuarios = 'https://backend-movie-8ay7.onrender.com/user';
        let urlPelicula = 'https://backend-movie-8ay7.onrender.com/peli';
        let urlComentarios = 'https://backend-movie-8ay7.onrender.com/comentarios';


        const fetchData = () => {
            if (navigator.onLine) {
                const requestUsuarios = fetch(urlUsuarios).then(response => response.json());
                const requestPeliculas = fetch(urlPelicula).then(response => response.json());
                const requestComentarios = fetch(urlComentarios).then(response => response.json());

                Promise.all([requestUsuarios, requestPeliculas, requestComentarios])
                    .then(([usuarios, peliculas, comentarios]) => {

                        const request = window.indexedDB.open('myDatabasePerfil', 1);
                        const requestCom = window.indexedDB.open('myDatabaseComentario', 1);
                        const requestPel = window.indexedDB.open('myDatabasePelicula', 1);

                        request.onerror = function (event) {
                            console.log('Error al abrir la base de datos', event);
                        };

                        requestCom.onerror = function (event) {
                            console.log('Error al abrir la base de datos', event);
                        };

                        requestPel.onerror = function (event) {
                            console.log('Error al abrir la base de datos', event);
                        };

                        request.onupgradeneeded = function (event) {
                            const db = event.target.result;

                            // Código para agregar usuarios a la base de datos de IndexedDB

                            // Crear object store para usuarios
                            const usuariosObjectStore = db.createObjectStore('usuarios', { keyPath: '_id' });
                            usuariosObjectStore.transaction.oncomplete = function (event) {
                                const usuariosObjectStore = db.transaction('usuarios', 'readwrite').objectStore('usuarios');
                                usuarios.forEach(usuario => {
                                    usuariosObjectStore.add(usuario);
                                });
                            };
                        };

                        requestCom.onupgradeneeded = function (event) {
                            const db = event.target.result;

                            // Crear object store para comentarios
                            const comentariosObjectStore = db.createObjectStore('comentarios', { keyPath: '_id' });
                            comentariosObjectStore.transaction.oncomplete = function (event) {
                                const comentariosObjectStore = db.transaction('comentarios', 'readwrite').objectStore('comentarios');
                                comentarios.forEach(comentario => {
                                    if (comentario._id) { // Validar que _id esté presente y sea válido
                                        comentariosObjectStore.add(comentario);
                                    }
                                });
                            };
                        };

                        requestPel.onupgradeneeded = function (event) {
                            const db = event.target.result;

                            // Crear object store para películas
                            const peliculasObjectStore = db.createObjectStore('peliculas', { keyPath: '_id' });
                            peliculasObjectStore.transaction.oncomplete = function (event) {
                                const peliculasObjectStore = db.transaction('peliculas', 'readwrite').objectStore('peliculas');
                                peliculas.forEach(pelicula => {
                                    peliculasObjectStore.add(pelicula);
                                });
                            };
                        };

                        requestPel.onsuccess = function (event) {
                            const db = event.target.result;
                            const transaction = db.transaction(['peliculas'], 'readonly');
                            const objectStore = transaction.objectStore('peliculas');
                            const getRequest = objectStore.getAll();
        
                            getRequest.onsuccess = function (event) {
                                setData(event.target.result);
                            };
                        };

                        request.onsuccess = function (event) {
                            const db = event.target.result;
                            const transaction = db.transaction(['usuarios'], 'readonly');
                            const objectStore = transaction.objectStore('usuarios');
                            const getRequest = objectStore.getAll();
        
                            getRequest.onsuccess = function (event) {
                                setData(event.target.result);
                            };
                        };
                    })
                    .catch(err => {
                        alert("Error a crear bases offline");
                    });
            } else {
                const request = window.indexedDB.open('myDatabasePelicula', 1);

                request.onsuccess = function (event) {
                    const db = event.target.result;
                    const transaction = db.transaction(['peliculas'], 'readonly');
                    const objectStore = transaction.objectStore('peliculas');
                    const getRequest = objectStore.getAll();

                    getRequest.onsuccess = function (event) {
                        setData(event.target.result);
                    };
                };

                const requestU = window.indexedDB.open('myDatabasePerfil', 1);

                requestU.onsuccess = function (event) {
                    const db = event.target.result;
                    const transaction = db.transaction(['usuarios'], 'readonly');
                    const objectStore = transaction.objectStore('usuarios');
                    const getRequest = objectStore.getAll();

                    getRequest.onsuccess = function (event) {
                        setData(event.target.result);
                    };
                };
            }
        };

        fetchData(); // Llamar a la función fetchData al cargar el componente

        const handleOnline = () => {
            fetchData(); // Llamar a la función fetchData cuando se recupere la conexión
        };

        window.addEventListener('online', handleOnline); // Agregar un event listener para el evento online

        return () => {
            window.removeEventListener('online', handleOnline); // Limpiar el event listener al desmontar el componente
        };
    }, []);
    */

    return (
        <div>
            <h1>Peliculas</h1>
            <div className="row">
                {data.map((pelicula) => (
                    <div className="col-md-3" key={pelicula._id}>
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
