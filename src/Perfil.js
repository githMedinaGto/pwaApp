import { React, useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Container, Row, Col } from 'react-bootstrap';


export default function Perfil() {
    const [comentariosResult, setComentariosResult] = useState([]);
    const [peliculasResult, setPeliculasResult] = useState([]);
    const [pusuarioResult, setUsuarioResult] = useState([]);

    const [formUser, setFormUser] = useState({
        nombre: '',
        contrasenia: ''  // Corrected the misspelling here
    });
    const [showLoginModal, setShowLoginModal] = useState(true);

    const handleLoginModalClose = () => {
        setShowLoginModal(false);
        setFormUser({
            nombre: '',
            contrasenia: ''
        });
    }

    const handleInputCredenciales = (event) => {
        const { name, value } = event.target;
        setFormUser({
            ...formUser,
            [name]: value,
        });
    }

    useEffect(() => {
        let urlUsuarios = 'https://backend-movie-8ay7.onrender.com/user';
        let urlPelicula = 'https://backend-movie-8ay7.onrender.com/peli';
        let urlComentarios = 'https://backend-movie-8ay7.onrender.com/comentarios';

        const fetchData = () => {
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
                })
                .catch(err => {
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
                });
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

    const handleRegistrarUsuario = () => {

        const request = window.indexedDB.open('myDatabasePerfil', 1);

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

    const handleEnviardatos = () => {
        if (navigator.onLine) {
            // Lógica para iniciar sesión utilizando fetch
            fetch('https://backend-movie-8ay7.onrender.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: formUser.nombre, contrasenia: formUser.contrasenia }),
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Credenciales inválidas');
                    }
                })
                .then(data => {
                    console.log("Inicio de sesión exitoso:", data.usuarioEncontrado.nombre);
                    setUsuarioResult(data.usuarioEncontrado.nombre);
                    // Lógica para cargar comentarios y películas favoritas
                    cargarComentariosUsuario(data.usuarioEncontrado._id);
                    cargarPeliculasFavoritas(data.usuarioEncontrado._id, data.usuarioEncontrado.peliculasFavoritas);
                    setShowLoginModal(false);
                })
                .catch(error => {
                    console.error('Error al iniciar sesión:', error);
                    alert("Usuario y/o contraseña no encontrados");
                });
        } else {
            const request = window.indexedDB.open('myDatabasePerfil', 1);

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
                        setUsuarioResult(formUser.nombre);
                        cargarComentariosUsuario(user._id);
                        cargarPeliculasFavoritas(user._id, user.peliculasFavoritas);
                        setShowLoginModal(false);
                    } else {
                        alert("Usuario no encontrado, validar credenciales");
                    }
                }
            }
        }
    }

    const cargarComentariosUsuario = (idUsuario) => {
        if (navigator.onLine) {
            // Lógica para cargar comentarios del usuario utilizando fetch
            fetch(`https://backend-movie-8ay7.onrender.com/comentario/${idUsuario}`)
                .then(response => response.json())
                .then(data => {
                    // Mostrar comentarios en la interfaz de usuario
                    const comentariosYPeliculas = []; // Array para almacenar los comentarios y películas combinados

                    // Suponiendo que tienes un arreglo llamado comentariosPeliculas que contiene los comentarios y películas
                    data.forEach(item => {
                        const comentario = item.comentario.texto; // Obtener el texto del comentario
                        const pelicula = item.pelicula.titulo; // Obtener el título de la película

                        const comentarioYPelicula = { Comentario: comentario, Pelicula: pelicula }; // Crear un objeto combinado
                        comentariosYPeliculas.push(comentarioYPelicula); // Agregar el objeto combinado al arreglo
                    });
                    setComentariosResult(comentariosYPeliculas);
                    console.log(comentariosYPeliculas);
                })
                .catch(error => {
                    console.error('Error al cargar los comentarios del usuario:', error);
                });
        } else {

            let comentariosA = [];
            let comenPel = [];
            const request = window.indexedDB.open('myDatabaseComentario', 1);

            request.onerror = function (event) {
                console.log('Error al abrir la base de datos', event);
            };

            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['comentarios'], 'readonly');
                const objectStore = transaction.objectStore('comentarios');
                const getRequest = objectStore.getAll();

                getRequest.onsuccess = function (event) {
                    const comentarios = event.target.result;
                    const comentario = comentarios.filter(u => u.usuario === idUsuario);
                    comentariosA = comentario;
                }
            }

            const requestP = window.indexedDB.open('myDatabasePelicula', 1);

            requestP.onerror = function (event) {
                console.log('Error al abrir la base de datos', event);
            };

            requestP.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['peliculas'], 'readonly');
                const objectStore = transaction.objectStore('peliculas');
                const getRequest = objectStore.getAll();

                getRequest.onsuccess = function (event) {
                    const peliculas = event.target.result;
                    if (Array.isArray(comentariosA)) {
                        //const idsPeliculas = comentariosA.map(comentario => comentario.idPelicula);
                        comentariosA.forEach((valor) => {
                            const pel = peliculas.find(u => u._id === valor.idPelicula);

                            if (pel) {
                                const comentarioYPelicula = { Comentario: valor.texto, Pelicula: pel.titulo };
                                comenPel.push(comentarioYPelicula);
                            }
                        });
                        setComentariosResult(comenPel);
                    } else {
                        console.error('comentariosA no es un arreglo');
                    }


                }
            }

        }
    }

    const cargarPeliculasFavoritas = (idUsuario, peliculasFavoritas) => {
        if (navigator.onLine) {
            // Lógica para cargar películas favoritas del usuario utilizando fetch
            fetch(`https://backend-movie-8ay7.onrender.com/peliculasFavoritas/${idUsuario}`)
                .then(response => response.json())
                .then(data => {
                    const peliculasOrdenadas = data.sort((a, b) => b.calificacion - a.calificacion);
                    // Mostrar películas favoritas en la interfaz de usuario
                    setPeliculasResult(peliculasOrdenadas);
                })
                .catch(error => {
                    console.error('Error al cargar las películas favoritas del usuario:', error);
                });
        } else {
            let peliculasEncontradas = [];
            const request = window.indexedDB.open('myDatabasePelicula', 1);

            request.onerror = function (event) {
                console.log('Error al abrir la base de datos', event);
            };

            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['peliculas'], 'readonly');
                const objectStore = transaction.objectStore('peliculas');
                const getRequest = objectStore.getAll();

                getRequest.onsuccess = function (event) {
                    const peliculas = event.target.result;

                    if (Array.isArray(peliculasFavoritas)) {
                        peliculasFavoritas.forEach((valor) => {
                            const pel = peliculas.find(u => u._id === valor);
                            if (pel) {
                                peliculasEncontradas.push(pel);
                            }
                        });
                        const peliculasOrdenadas = peliculasEncontradas.sort((a, b) => b.calificacion - a.calificacion);
                        setPeliculasResult(peliculasOrdenadas);
                    } else {
                        console.error('pusuarioResult.peliculasFavoritas no es un arreglo');
                    }


                }
            }

        }
    }


    return (
        <div>
            <h1>Perfil</h1>

            {showLoginModal && (
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
            )}

            {pusuarioResult ? <h2>Bienvenido {pusuarioResult}!</h2> : <h1>Usuario no encontrado</h1>}

            <br />

            <Row>
                <Col md={6}>
                    {comentariosResult ? (
                        <div>
                            <h2>Comentarios hechos</h2>
                            {comentariosResult.map((comentario, index) => (
                                <h3 key={index}>Comentario: {comentario.Comentario} de la película {comentario.Pelicula}</h3>
                            ))}
                        </div>
                    ) : <h3>No se han hecho comentarios</h3>}
                </Col>

                <Col md={6}>
                    {peliculasResult ? (
                        <div>
                            <h2>Películas calificadas</h2>
                            {peliculasResult.map((pelicula, index) => (
                                <h3 key={index}>Película: {pelicula.titulo} con una calificación de {pelicula.calificacion}</h3>
                            ))}
                        </div>
                    ) : <h3>No se han calificado películas</h3>}
                </Col>
            </Row>
        </div>
    )
}
