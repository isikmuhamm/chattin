// src/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // react-router-dom'dan yönlendirme için

const Home = () => {
    const navigate = useNavigate(); // useNavigate ile yönlendirme fonksiyonu

    const goToRegister = () => {
        navigate('/register'); // Kayıt sayfasına yönlendir
    };

    const goToLogin = () => {
        navigate('/login'); // Giriş sayfasına yönlendir
    };

    return (
        <div>
            <h1>Bugün Chattin mi?</h1>
            <h1>Canlı chatmek için chattini seçin!</h1>
            <button onClick={goToLogin}>Login</button>
            <button onClick={goToRegister} style={{ marginLeft: '10px' }}>Register</button>
        </div>
    );
};

export default Home;
