import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'; // Chat.css dosyasını içe aktar

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
        <div className="normal-container">
            <div className="chat-header">
                <h1>Chattin'e kayıt ol!</h1>
            </div>
            <div className="message-header">
                <form onSubmit={handleRegister} className="form-container">
                    <div className="form-group">
                        <label>Kullanıcı Adı:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="form-error">{error}</p>}
                    <div className="form-group">
                        <label>Şifre:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="logout-button">Kayıt Ol</button>
                </form>
            </div>

            <div className="user-info" style={{ justifyContent: 'right', marginRight: '40px'}}>
            <p>
                Zaten kayıtlıysanız, <span style={{ cursor: 'pointer', color: 'blue' }} onClick={handleLoginRedirect}>giriş yapın.</span>.
            </p>
            </div>
        </div>
    );
}

export default Register;
