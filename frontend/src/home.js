// src/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // react-router-dom'dan yönlendirme için
import './style.css'; // Chat.css dosyasını içe aktar

const Home = () => {
    const navigate = useNavigate(); // useNavigate ile yönlendirme fonksiyonu

    const goToRegister = () => {
        navigate('/register'); // Kayıt sayfasına yönlendir
    };

    const goToLogin = () => {
        navigate('/login'); // Giriş sayfasına yönlendir
    };

    return (
        <div className="normal-container"> {/* Chat.css'ten stil uygulanıyor */}
            <div className="chat-header">
                <h1>Bugün Chattin mi?</h1>
            </div>
            <div className="message-header">
                <h1>Canlı chatmek için chattini seçin!</h1>
                <div className="user-info" style={{ alignItems: 'center', marginBottom: '40px'}}>
                <button onClick={goToLogin} className="send-button" >Login</button>
                <button onClick={goToRegister} className="logout-button">Register</button>
                </div>
            </div>
        </div>
    );
};

export default Home;
