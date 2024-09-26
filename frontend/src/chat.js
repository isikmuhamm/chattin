import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // Oturum kapatma
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username'); // Kullanıcı adını da kaldır
    localStorage.removeItem('userId'); // Kullanıcı ID'sini de kaldır
    navigate('/');
  };

  // Tüm kullanıcıları ve eski mesajları çek
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token) {
      navigate('/'); // Eğer token yoksa login sayfasına yönlendir
    }
    const fetchData = async () => {
      try {
        // Tüm kullanıcıları al
        const userResponse = await axios.get('http://localhost:8000/users/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(userResponse.data);

        // Eski mesajlaştığı kullanıcıları al
        const chatUserResponse = await axios.get(`http://localhost:8000/users/chat/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChatUsers(chatUserResponse.data);
      } catch (err) {
        console.log('Error fetching data:', err.response ? err.response.data : err.message);
      }
    };

    fetchData();
  }, [navigate]);

  // Kullanıcıyı seçtiğinde geçmiş mesajları al
  const fetchMessagesWithUser = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:8000/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages); // API'den gelen mesajları ayarlayın
      setSelectedUser(userId);
    } catch (err) {
      console.log('Error fetching messages with user:', err.response ? err.response.data : err.message);
    }
  };

  // Mesaj gönderme
  const sendMessage = async () => {
    const token = localStorage.getItem('token');
    const senderId = localStorage.getItem('userId'); // Kullanıcı ID'sini al
    try {
      await axios.post(
        'http://localhost:8000/messages/',
        { sender_id: senderId, recipient_id: selectedUser, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage(''); // Mesajı temizle
      // Mesaj gönderildikten sonra geçmiş mesajları güncelle
      fetchMessagesWithUser(selectedUser); // Seçilen kullanıcıyla mesajları güncelle
    } catch (err) {
      console.log('Error sending messages:', err.response ? err.response.data : err.message);
    }
  };

  // Oturum açan kullanıcı adını al
  const username = localStorage.getItem('username');

  return (
    <div className="chat-container">
      <header>
        <h2>Chat</h2>
        {username && <p>{username}, hoş geldin!</p>} {/* Kullanıcı adı göster */}
        <button onClick={handleLogout}>Oturumu Kapat</button>
      </header>
      <div className="chat-content">
        <div className="sidebar">
          <div className="users-list">
            <h3>Eski Mesajlar</h3>
            {/* Eski mesajlaşmaları burada listele */}
            {chatUsers.map((user) => (
              <div key={user.id} onClick={() => fetchMessagesWithUser(user.id)} style={{ cursor: 'pointer' }}>
                {user.username}
              </div>
            ))}

            <h3>Tüm Kullanıcılar</h3>
            {users.map((user) => (
              <div key={user.id} onClick={() => fetchMessagesWithUser(user.id)} style={{ cursor: 'pointer' }}>
                {user.username}
              </div>
            ))}
          </div>
        </div>
        <div className="message-area">
          {selectedUser ? (
            <>
              <h3>{selectedUser}'e Mesaj</h3>
              <div className="message-list">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id}>
                      <strong>{message.sender_id === localStorage.getItem('userId') ? 'Ben' : message.sender_username}:</strong> {message.content}
                    </div>
                  ))
                ) : (
                  <p>Geçmiş mesaj yok</p>
                )}
              </div>
              <div className="message-box">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Gönder</button>
              </div>
            </>
          ) : (
            <p>Mesaj göndermek için kullanıcı seçin</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
