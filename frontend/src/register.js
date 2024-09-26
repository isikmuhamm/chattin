import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        const response = await fetch('http://localhost:8000/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            navigate('/login');
        } else {
            const errorData = await response.json();
            setError(errorData.detail);
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login'); // Giriş sayfasına yönlendirme
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
            <p>
                Zaten kayıtlıysanız, <span style={{ cursor: 'pointer', color: 'blue' }} onClick={handleLoginRedirect}>giriş yapın</span>.
            </p>
        </div>
    );
}

export default Register;
