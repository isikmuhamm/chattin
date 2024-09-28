import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const goToRegister = () => {
    navigate('/register'); // Kayıt sayfasına yönlendir
};

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Giriş isteği yap
      const response = await axios.post(
        'http://localhost:8000/token',
        new URLSearchParams({
          username: username,
          password: password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const token = response.data.access_token; // Token'ı al
      const userId = response.data.user_id; // User ID'yi al

      // Token, kullanıcı ID'si ve kullanıcı adını localStorage'a kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);

      // WebSocket bağlantısını kur
      const socket = new WebSocket(`ws://localhost:8000/ws/${username}`);
      socket.onopen = () => {
        console.log('WebSocket bağlantısı kuruldu');
      };
      socket.onclose = () => {
        console.log('WebSocket bağlantısı kapandı');
      };

      // Giriş başarılı, chat sayfasına yönlendir
      navigate('/chat');
    } catch (err) {
      setError('Kullanıcı adı veya şifre yanlış');
    }
  };




  return (
    <div className="normal-container">
      <div className="chat-header">
      <h1>Chattin'e Giriş Yap</h1>
      </div>
    <div className="message-header">
    {error && <p className="form-error">{error}</p>}
    <form onSubmit={handleLogin} className="form-container">
        <div className="form-group">
            <label>Kullanıcı Adı:</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
        </div>
        <div className="form-group">
            <label>Şifre:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
        </div>
        <button type="submit" className="send-button">Giriş Yap</button>
      </form>
    </div>
        <div className="user-info" style={{ justifyContent: 'right', marginRight: '40px'}}>
            <p>
                Eğer kayıtlı değilseniz, <span style={{ cursor: 'pointer', color: 'blue' }} onClick={goToRegister}>kayıt olun</span>.
            </p>
        </div>
    </div>

  );
}

export default Login;
