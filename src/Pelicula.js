import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import InputGroup from 'react-bootstrap/InputGroup';
import { Modal, Button, Form } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import useSpeechRecognition from './hooks/useSpeechRecognition.ts';


export default function Pelicula() {
    const { id } = useParams();
    const history = useNavigate();
    const [data, setData] = useState([])
    const [movie, setMovie] = useState({});
    const [mode, setMode] = useState('online');
    const [show, setShow] = useState(true);
    const { text, startListening, stopListening, isListening, hasRecognitionSupport, } = useSpeechRecognition();
    let url = `https://backend-movie-8ay7.onrender.com/peli/${id}`;

    const [formData, setFormData] = useState({
        comentario: '',
        calificacion: 0,
    });

    const [formUser, setFormUser] = useState({
        nombre: '',
        contrasenia: ''  // Corrected the misspelling here
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleInputCredenciales = (event) => {
        const { name, value } = event.target;
        setFormUser({
            ...formUser,
            [name]: value,
        });
    }

    const handleEnviarClick = () => {
        const comentarioRegex = /^[a-zA-Z\u00C0-\u024F\s]*$/;
        const calificacionRegex = /^\d*\.?\d*$/;

        if (formData.comentario.trim() === '' && !calificacionRegex.test(formData.calificacion)) {
            alert('El comentario o la calificación son requeridos.');
            return;
        }

        if (formData.comentario.trim() !== '' && !comentarioRegex.test(formData.comentario)) {
            alert('El comentario solo debe contener letras y espacios.');
            return;
        }

        if (formData.calificacion !== '0' && formData.comentario.trim() === '' && (!calificacionRegex.test(formData.calificacion) || formData.calificacion <= 0 || formData.calificacion >= 11)) {
            alert('La calificación debe ser un valor numérico y mayor a 0 y menor a 11');
            return;
        }

        setShowLoginModal(true); // Abrir el modal de login si se cumplen las validaciones
        console.log('Datos del formulario:', formData);
    };

    const handleEnviardatos = () => {
        if (formUser.nombre === '' && formUser.contrasenia === '') {
            alert('Se requieren credenciales para el envio de datos.');
            return;
        }

        let url = "https://backend-movie-8ay7.onrender.com/login";

        if (navigator.onLine) {
            // En línea: Realizar el registro del usuario a través de la API
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formUser)
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Error al iniciar sesion, usuario inexistente');
                    }
                })
                .then(data => {
                    console.log("Usuario ingresado con éxito:", data.usuarioEncontrado.nombre);

                    if (formData.comentario !== '' && (formData.calificacion === '0' || formData.calificacion === 0)) {
                        //Enviar comentario
                        handleEnviarComentario(formData.comentario, data.usuarioEncontrado._id);
                    } else {
                        //enviar calificacion
                        handleEnviarCalificacion(formData.calificacion, data.usuarioEncontrado._id);
                    }

                    alert("Usuario a registrado con éxito el dato");
                })
                .catch(error => {
                    console.error('Error al ingresar el usuario:', error);
                    alert("Ocurrió un error al registrar con las credenciales. Por favor, inténtalo de nuevo más tarde.", error);
                });
        } else {
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
                    const usuario = event.target.result;
                    const user = usuario.find(u => u.nombre === formUser.nombre && u.contrasenia === formUser.contrasenia);
                    if (user) {
                        console.log("Usuario ingresado con éxito:", formUser.nombre);
                        alert("Usuario a registrado con éxito el dato en offline");

                        if (formData.comentario !== '' && (formData.calificacion === '0' || formData.calificacion === 0)) {
                            //Enviar comentario
                            handleEnviarComentario(formData.comentario, user._id);
                        } else {
                            //enviar calificacion
                            handleEnviarCalificacion(formData.calificacion, user._id);
                        }
                    } else {
                        alert("Usuario no encontrado, validar credenciales");
                    }
                }
            }

            if (formData.comentario.trim() !== '' && formData.calificacion === '0') {
                //Enviar comentario
            } else {
                //enviar calificacion
            }
        };
    }

    const handleRegistrarUsuario = () => {

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
                const usuarios = event.target.result.map(usuario => usuario.nombre); // Obtener solo los nombres de los usuarios
                //const nombreAComparar = 'nombre a comparar'; // Aquí colocas el nombre que deseas comparar

                if (usuarios.includes(formUser.nombre)) {
                    alert('El usuario ya existe');
                    return;
                } else {
                    if (formUser.nombre !== '' && formUser.contrasenia !== '') {
                        const nuevoUsuario = {
                            nombre: formUser.nombre,
                            contrasenia: formUser.contrasenia
                        };

                        if (navigator.onLine) {
                            // En línea: Realizar el registro del usuario a través de la API
                            fetch('https://backend-movie-8ay7.onrender.com/registro', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(nuevoUsuario)
                            })
                                .then(response => {
                                    if (response.ok) {
                                        return response.json();
                                    } else {
                                        throw new Error('Error al registrar el usuario, usuario existente');
                                    }
                                })
                                .then(data => {
                                    console.log("Usuario registrado con éxito:", data);
                                    alert("Usuario registrado con éxito. Por favor, inicia sesión.");
                                })
                                .catch(error => {
                                    console.error('Error al registrar el usuario:', error);
                                    alert("Ocurrió un error al registrar el usuario. Por favor, inténtalo de nuevo más tarde.", error);
                                });
                        } else {
                            // Modo offline: Almacenar el usuario localmente en IndexedDB
                            const request = window.indexedDB.open('offlineDB', 1);

                            request.onsuccess = function (event) {
                                const db = event.target.result;
                                const transaction = db.transaction(['usuarios'], 'readwrite');
                                const objectStore = transaction.objectStore('usuarios');
                                const addUserRequest = objectStore.add(nuevoUsuario);

                                addUserRequest.onsuccess = function (event) {
                                    console.log('Usuario almacenado localmente en modo offline');
                                    alert('Usuario registrado localmente en modo offline. La sincronización se realizará cuando la conexión esté disponible.');

                                    // Verificar si hay conexión al detectar un cambio en la conectividad
                                    window.addEventListener('online', () => {

                                        const request = window.indexedDB.open('offlineDB', 1);

                                        request.onsuccess = function (event) {
                                            const db = event.target.result;
                                            const transaction = db.transaction(['usuarios'], 'readwrite');
                                            const objectStore = transaction.objectStore('usuarios');

                                            const getAllRequest = objectStore.getAll();

                                            getAllRequest.onsuccess = function (event) {
                                                const users = event.target.result;
                                                console.log('Usuarios almacenados:', users);
                                                // Sincronizar los usuarios almacenados localmente con el servidor
                                                users.forEach(usuario => {
                                                    fetch('https://backend-movie-8ay7.onrender.com/registro', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify(usuario)
                                                    })
                                                        .then(response => {
                                                            if (!response.ok) {
                                                                alert("Usuario registrado correctamente");
                                                                // Eliminar el usuario sincronizado de IndexedDB
                                                                const deleteRequest = objectStore.delete(usuario.id);
                                                                deleteRequest.onsuccess = function (event) {
                                                                    console.log('Usuario sincronizado eliminado de IndexedDB');
                                                                };
                                                            }
                                                            if (response.ok) {
                                                                alert("Usuario registrado correctamente");
                                                                // Eliminar el usuario sincronizado de IndexedDB
                                                                const deleteRequest = objectStore.delete(usuario.id);
                                                                deleteRequest.onsuccess = function (event) {
                                                                    console.log('Usuario sincronizado eliminado de IndexedDB');
                                                                };

                                                            }
                                                        })
                                                        .catch(error => {
                                                            console.error('Error al sincronizar el usuario con el servidor', error);
                                                        });
                                                });
                                            };
                                        };
                                    });
                                };

                                addUserRequest.onerror = function (event) {
                                    console.error('Error al almacenar el usuario localmente en modo offline', event);
                                    alert('Ocurrió un error al registrar el usuario localmente en modo offline. Por favor, inténtalo de nuevo más tarde.');
                                };
                            };

                            request.onerror = function (event) {
                                console.log('Error al abrir la base de datos', event);
                            };

                            request.onupgradeneeded = function (event) {
                                const db = event.target.result;
                                const objectStore = db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });

                                objectStore.transaction.oncomplete = function (event) {
                                    const usuarioObjectStore = db.transaction('usuarios', 'readwrite').objectStore('usuarios');
                                    usuarioObjectStore.add(nuevoUsuario);
                                };
                            };
                        }
                    } else {
                        alert("No se permiten campos vacíos");
                    }
                }
            };
        };
    }

    if (!id) {
        history.push('/');
    }


    if (text) {
        formData.comentario = text;
    }

    //
    useEffect(() => {
        if (navigator.onLine) {
            fetch(url)
                .then((response) => {
                    response.json()
                        .then((data) => {
                            setMovie(data);
                            setMode('online');

                            openDB('myDatabase', 1, {
                                upgrade(db) {
                                    const peliculasObjectStore = db.createObjectStore('peliculas', { keyPath: '_id' });
                                    data.forEach(function (pelicula) {
                                        peliculasObjectStore.add(pelicula);
                                    });
                                },
                            }).then((db) => {
                                const request = window.indexedDB.open('myDatabase', 1);

                                request.onerror = function (event) {
                                    console.log('Error al abrir la base de datos', event);
                                };

                                request.onsuccess = function (event) {
                                    const db = event.target.result;
                                    const transaction = db.transaction(['peliculas'], 'readonly');
                                    const objectStore = transaction.objectStore('peliculas');
                                    const getRequest = objectStore.getAll();

                                    getRequest.onsuccess = function (event) {
                                        const data = event.target.result;
                                        // Buscar película por _id
                                        const peliculaEncontrada = data.find(pelicula => pelicula._id === id);
                                        if (peliculaEncontrada) {
                                            setMovie(peliculaEncontrada);
                                        }
                                    };
                                };
                            }).catch((error) => {
                                setMode('offline');
                                console.error('Error al abrir la base de datos', error);
                            });
                        });
                })
                .catch((err) => {
                    setMode('offline');

                    const request = window.indexedDB.open('myDatabase', 1);

                    request.onerror = function (event) {
                        console.log('Error al abrir la base de datos', event);
                    };

                    request.onsuccess = function (event) {
                        const db = event.target.result;
                        const transaction = db.transaction(['peliculas'], 'readonly');
                        const objectStore = transaction.objectStore('peliculas');
                        const getRequest = objectStore.getAll();

                        getRequest.onsuccess = function (event) {
                            const data = event.target.result;
                            // Buscar película por _id
                            const peliculaEncontrada = data.find(pelicula => pelicula._id === id);
                            if (peliculaEncontrada) {
                                setMovie(peliculaEncontrada);
                            }
                        };
                    };
                });
        } else {
            setMode('offline');

            const request = window.indexedDB.open('myDatabase', 1);

            request.onerror = function (event) {
                console.log('Error al abrir la base de datos', event);
            };

            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['peliculas'], 'readonly');
                const objectStore = transaction.objectStore('peliculas');
                const getRequest = objectStore.getAll();

                getRequest.onsuccess = function (event) {
                    const data = event.target.result;
                    // Buscar película por _id
                    const peliculaEncontrada = data.find(pelicula => pelicula._id === id);
                    if (peliculaEncontrada) {
                        setMovie(peliculaEncontrada);
                    }
                };
            };
        }
    }, [id, history, url]);

    const [showComentarModal, setShowComentarModal] = useState(false);
    const [showCalificarModal, setShowCalificarModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleComentarModalClose = () => {
        setShowComentarModal(false);
        setFormData({
            comentario: '',
            calificacion: 0,
        });
    }
    const handleComentarModalShow = () => setShowComentarModal(true);

    const handleCalificarModalClose = () => {
        setShowCalificarModal(false);
        setFormData({
            comentario: '',
            calificacion: 0,
        });
    }
    const handleCalificarModalShow = () => setShowCalificarModal(true);

    const handleLoginModalClose = () => {
        setShowLoginModal(false);
        setFormUser({
            nombre: '',
            contrasenia: ''
        });
    }
    const handleLoginModalShow = () => setShowLoginModal(true);


    useEffect(() => {
        let url = "https://backend-movie-8ay7.onrender.com/user";

        fetch(url)
            .then((response) => {
                response.json()
                    .then((result) => {
                        setData(result);
                        const request = window.indexedDB.open('dbUsers', 1);

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

    }, []);

    const handleEnviarComentario = (comentario, idUsuario) => {
        if (navigator.onLine) {
            // En línea: Realizar el registro del comentario a través de la API
            fetch('https://backend-movie-8ay7.onrender.com/comentarioAdd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "idPelicula": movie._id, "texto": comentario, "usuario": idUsuario })
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Error al agregar el comentario');
                    }
                })
                .then(data => {
                    console.log("Comentario agregado con éxito:", data);
                    alert("Comentario agregado con éxito.");
                })
                .catch(error => {
                    console.error('Error al agregar el comentario:', error);
                    alert("Ocurrió un error al agregar el comentario. Por favor, inténtalo de nuevo más tarde.");
                });
        } else {
            // Modo offline: Almacenar el comentario localmente en IndexedDB
            const nuevoComentario = {
                idPelicula: movie._id,
                texto: comentario,
                usuario: idUsuario
            };

            const request = window.indexedDB.open('offlineDB', 1);

            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['comentarios'], 'readwrite');
                const objectStore = transaction.objectStore('comentarios');
                const addComentarioRequest = objectStore.add(nuevoComentario);

                addComentarioRequest.onsuccess = function (event) {
                    console.log('Comentario almacenado localmente en modo offline');
                    alert('Comentario agregado localmente en modo offline. La sincronización se realizará cuando la conexión esté disponible.');

                    // Verificar si hay conexión al detectar un cambio en la conectividad
                    window.addEventListener('online', () => {
                        const request = window.indexedDB.open('offlineDB', 1);

                        request.onsuccess = function (event) {
                            const db = event.target.result;
                            const transaction = db.transaction(['comentarios'], 'readwrite');
                            const objectStore = transaction.objectStore('comentarios');

                            const getAllRequest = objectStore.getAll();

                            getAllRequest.onsuccess = function (event) {
                                const comentarios = event.target.result;
                                console.log('Comentarios almacenados:', comentarios);
                                // Sincronizar los comentarios almacenados localmente con el servidor
                                comentarios.forEach(comentario => {
                                    fetch('https://backend-movie-8ay7.onrender.com/comentarioAdd', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(comentario)
                                    })
                                        .then(response => {
                                            if (response.ok) {
                                                alert("Comentario registrado correctamente");
                                                // Eliminar el comentario sincronizado de IndexedDB
                                                const deleteRequest = objectStore.delete(comentario.id);
                                                deleteRequest.onsuccess = function (event) {
                                                    console.log('Comentario sincronizado eliminado de IndexedDB');
                                                };
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Error al sincronizar el comentario con el servidor', error);
                                        });
                                });
                            };
                        };
                    });
                };

                addComentarioRequest.onerror = function (event) {
                    console.error('Error al almacenar el comentario localmente en modo offline', event);
                    alert('Ocurrió un error al agregar el comentario localmente en modo offline. Por favor, inténtalo de nuevo más tarde.');
                };
            };

            request.onerror = function (event) {
                console.log('Error al abrir la base de datos', event);
            };

            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                const objectStore = db.createObjectStore('comentarios', { keyPath: 'id', autoIncrement: true });

                objectStore.transaction.oncomplete = function (event) {
                    const comentarioObjectStore = db.transaction('comentarios', 'readwrite').objectStore('comentarios');
                    comentarioObjectStore.add(nuevoComentario);
                };
            };
        }
    }

    const handleEnviarCalificacion = (califiacion, idUsuario) => {
        if (navigator.onLine) {
            // En línea: Realizar el registro del comentario a través de la API
            fetch('https://backend-movie-8ay7.onrender.com/actualizarCalificacion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "idPelicula": movie._id, "califiacion": califiacion, "usuario": idUsuario })
            })
                .then(response => {
                    console.log(response);
                    if (response.ok) {
                        return response.json();
                    } else {
                        return response.json().then(data => {
                            throw new Error(data.message);
                        });
                    }
                })
                .then(data => {
                    console.log(data);
                    console.log("Calificación agregado con éxito:", data);
                    alert("Calificación agregado con éxito.");
                })
                .catch(error => {
                    console.error('Error al agregar la calificación:', error.message);
                    alert("Ocurrió un error al agregar la calificación: " + error.message);
                });
        } else {
            // Modo offline: Almacenar el comentario localmente en IndexedDB
            const nuevoComentario = {
                idPelicula: movie._id,
                calificacion: califiacion,
                usuario: idUsuario
            };

            const request = window.indexedDB.open('offlineDBC', 1);

            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['calificacion'], 'readwrite');
                const objectStore = transaction.objectStore('calificacion');
                const addComentarioRequest = objectStore.add(nuevoComentario);

                addComentarioRequest.onsuccess = function (event) {
                    console.log('Calificacion almacenado localmente en modo offline');
                    alert('Calificacion agregado localmente en modo offline. La sincronización se realizará cuando la conexión esté disponible.');

                    // Verificar si hay conexión al detectar un cambio en la conectividad
                    window.addEventListener('online', () => {
                        const request = window.indexedDB.open('offlineDBC', 1);

                        request.onsuccess = function (event) {
                            const db = event.target.result;
                            const transaction = db.transaction(['calificacion'], 'readwrite');
                            const objectStore = transaction.objectStore('calificacion');

                            const getAllRequest = objectStore.getAll();

                            getAllRequest.onsuccess = function (event) {
                                const comentarios = event.target.result;
                                console.log('Calificacion almacenada:', comentarios);
                                // Sincronizar los comentarios almacenados localmente con el servidor
                                comentarios.forEach(comentario => {
                                    fetch('https://backend-movie-8ay7.onrender.com/comentarioAdd', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(comentario)
                                    })
                                        .then(response => {
                                            if (response.ok) {
                                                alert("Calificacion registrado correctamente");
                                                // Eliminar el comentario sincronizado de IndexedDB
                                                const deleteRequest = objectStore.delete(comentario.id);
                                                deleteRequest.onsuccess = function (event) {
                                                    console.log('Calificacion sincronizado eliminado de IndexedDB');
                                                };
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Error al sincronizar la calificacion con el servidor', error);
                                        });
                                });
                            };
                        };
                    });
                };

                addComentarioRequest.onerror = function (event) {
                    console.error('Error al almacenar la calificacion localmente en modo offline', event);
                    alert('Ocurrió un error al agregar la calificacion localmente en modo offline. Por favor, inténtalo de nuevo más tarde.');
                };
            };

            request.onerror = function (event) {
                console.log('Error al abrir la base de datos', event);
            };

            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                const objectStore = db.createObjectStore('calificacion', { keyPath: 'id', autoIncrement: true });

                objectStore.transaction.oncomplete = function (event) {
                    const comentarioObjectStore = db.transaction('calificacion', 'readwrite').objectStore('calificacion');
                    comentarioObjectStore.add(nuevoComentario);
                };
            };
        }
    }

    return (
        <div>
            <div><h1>Detalle de la pelicula</h1></div>
            <div>
                {mode === 'offline' ?
                    <Alert variant="warning" onClose={() => setShow(false)} dismissible>
                        <Alert.Heading>You are in offline mode or some issue with connection</Alert.Heading>
                        <p>Se encuentra modo sin conexión</p>
                    </Alert> : null
                }
            </div>
            <br></br>
            {movie._id ? (
                <div>
                    <h2 className="card-title">{movie.titulo}</h2>
                    <img src={movie.ruta} class="card-img-top" alt={movie.titulo} style={{ width: '80%', height: '80%', objectFit: 'cover' }} />
                    <p className="card-text">Sinopsis: {movie.sinopsis}</p>
                    <p className="card-text">Elenco: {movie.actores}</p>
                    <p className="card-text">Calificación: {movie.calificacion}</p>
                    <Button variant="primary" onClick={handleComentarModalShow} style={{ marginRight: '10px' }}>
                        Comentar
                    </Button>
                    <Button variant="primary" onClick={handleCalificarModalShow} style={{ marginRight: '10px' }}>
                        Calificar
                    </Button>
                </div>
            ) : (
                <h1>Película no encontrada</h1>
            )}

            <Modal show={showComentarModal} onHide={handleComentarModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Comentar sobre la película</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Comentario</Form.Label>
                            {
                                isListening ? <div>El navegador esta escuchando</div> : null
                            }

                            <Form.Control as="textarea" rows={3} name="comentario" value={formData.comentario} onChange={handleInputChange} />
                        </Form.Group>

                        {
                            hasRecognitionSupport ? (
                                <div>
                                    <Button variant="secondary" type="button" style={{ marginRight: '10px' }} id="btnStart" onClick={startListening}>Comenzar reconocimiento de Voz</Button>
                                    <Button variant="secondary" type="button" style={{ marginRight: '10px' }} id="btnStop" onClick={stopListening}>Para reconocimiento de Voz</Button>
                                </div>
                            ) : (
                                <h1>El navegador no soporta el reconocimiento de vox</h1>
                            )


                        }



                        <Button variant="primary" style={{ marginRight: '10px' }} onClick={handleEnviarClick}>Enviar</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showCalificarModal} onHide={handleCalificarModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Calificar la película</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Calificación</Form.Label>
                            <Form.Control type="number" step="0.1" min="1" max="10" name="calificacion" value={formData.calificacion} onChange={handleInputChange} />
                        </Form.Group>
                        <Button variant="primary" style={{ marginRight: '10px' }} onClick={handleEnviarClick}>Enviar</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showLoginModal} onHide={handleLoginModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Inicio de sesión / Registro</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de usuario</Form.Label>
                            <Form.Control type="text" name="nombre" value={formUser.nombre} onChange={handleInputCredenciales} />
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control type="password" name="contrasenia" value={formUser.contrasenia} onChange={handleInputCredenciales} />
                        </Form.Group>
                        <Button variant="primary" style={{ marginRight: '10px' }} onClick={handleEnviardatos}>Enviar</Button>
                        <Button variant="primary" style={{ marginRight: '10px' }} onClick={handleRegistrarUsuario}>Registrarse</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}
