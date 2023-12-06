import React, { useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';

export default function Users() {
    const [data, setData] = useState([])
    const [mode, setMode] = useState('online');
    const [show, setShow] = useState(true);
    useEffect(() => {
        let url = "https://jsonplaceholder.typicode.com/users"

        fetch(url).then((response) => {
            response.json().then((result) => {
                //console.log("Result", result);
                setData(result)
                localStorage.setItem("users", JSON.stringify(result));
            })
        }).catch(err => {
            setMode('offline')
            let collection = localStorage.getItem('users');
            setData(JSON.parse(collection))
        })
    }, [])

    return (
        <div>
            <h1>Users</h1>
            <br></br>
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
            <Table striped bordered hover variant="">
                <thead>
                    <tr>
                        <th>id</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.address.street}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )
}