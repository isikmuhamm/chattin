import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const socket = useRef(null); // WebSocket referansı

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    if (socket.current) {
      socket.current.close(); // WebSocket'i kapat
    }
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    if (!token) {
      navigate('/'); // Eğer token yoksa login sayfasına yönlendir
    }

    // WebSocket bağlantısını aç
    socket.current = new WebSocket(`ws://localhost:8000/ws/${username}`);

    socket.current.onopen = () => {
      console.log('WebSocket bağlantısı kuruldu');
    };

    socket.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };

    socket.current.onclose = () => {
      console.log('WebSocket bağlantısı kapandı');
    };

    const fetchData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:8000/users/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const filteredUsers = userResponse.data.filter(user => user.username !== username);
        setUsers(filteredUsers);

        const chatUserResponse = await axios.get(`http://localhost:8000/users/chat/?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const filteredChatUsers = chatUserResponse.data.filter(user => user.username !== username);
        setChatUsers(filteredChatUsers);

        const onlineUserResponse = await axios.get('http://localhost:8000/online-users/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOnlineUsers(onlineUserResponse.data);
      } catch (err) {
        console.log('Error fetching data:', err.response ? err.response.data : err.message);
      }
    };

    fetchData();

    return () => {
      socket.current.close();
    };
  }, [navigate]);

  const fetchMessagesWithUser = async (userId, username) => {
    const token = localStorage.getItem('token');
    try {
      setSelectedUser({ id: userId, username: username });

      const response = await axios.get(`http://localhost:8000/messages/?user_id=${localStorage.getItem('userId')}&target_user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(response.data.messages);
    } catch (err) {
      console.log('Error fetching messages with user:', err.response ? err.response.data : err.message);
    }
  };

  const sendMessage = async () => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket bağlantısı kapalı, mesaj gönderilemedi');
      return;
    }

    const senderId = localStorage.getItem('userId');
    const messageToSend = {
      sender_id: senderId,
      recipient_id: selectedUser.id,
      content: newMessage,
    };
    console.log('Mesaj gönderiliyor:', messageToSend);

    socket.current.send(JSON.stringify(messageToSend));

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        sender_id: senderId,
        recipient_id: selectedUser.id,
        content: newMessage,
      },
    ]);

    setNewMessage('');
  };

  const username = localStorage.getItem('username');

  return (
    <div className="chat-container" style={{ paddingLeft: '30px' }}>
      <header>
        <h2>Chat</h2>
        {username && <p>{username}, hoş geldin!</p>}
        <button onClick={handleLogout}>Oturumu Kapat</button>
      </header>
      <div className="chat-content">
        <div className="sidebar">
          <div className="users-list">
            <h3>Eski Mesajlar</h3>
            {chatUsers
              .sort((a, b) => {
                const aIsOnline = onlineUsers.some((onlineUser) => onlineUser.username === a.username);
                const bIsOnline = onlineUsers.some((onlineUser) => onlineUser.username === b.username);
                return bIsOnline - aIsOnline;
              })
              .map((user) => (
                <div
                  key={user.id}
                  onClick={() => fetchMessagesWithUser(user.id, user.username)}
                  style={{
                    cursor: 'pointer',
                    fontWeight: onlineUsers.some((onlineUser) => onlineUser.id === user.id)
                      ? 'bold'
                      : 'normal',
                    color: onlineUsers.some((onlineUser) => onlineUser.id === user.id)
                      ? 'green'
                      : 'black',
                  }}
                >
                  {user.username}
                </div>
              ))}

            <h3>Tüm Kullanıcılar</h3>
            {users
              .filter(user => !chatUsers.some(chatUser => chatUser.id === user.id))
              .sort((a, b) => {
                const aIsOnline = onlineUsers.some((onlineUser) => onlineUser.username === a.username);
                const bIsOnline = onlineUsers.some((onlineUser) => onlineUser.username === b.username);
                return bIsOnline - aIsOnline;
              })
              .map((user) => (
                <div
                  key={user.id}
                  onClick={() => fetchMessagesWithUser(user.id, user.username)}
                  style={{
                    cursor: 'pointer',
                    fontWeight: onlineUsers.some((onlineUser) => onlineUser.username === user.username) ? 'bold' : 'normal',
                    color: onlineUsers.some((onlineUser) => onlineUser.username === user.username) ? 'green' : 'black'
                  }}
                >
                  {user.username}
                </div>
              ))}
          </div>
        </div>
        <div className="message-area">
          {selectedUser ? (
            <>
              <h3>{selectedUser.username}'e Mesaj</h3>
              <div className="message-list">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    return (
                      <div key={message.id}>
                        <strong>
                          {message.sender_id === parseInt(localStorage.getItem('userId'), 10) ? 'Ben' : selectedUser.username}:
                        </strong> {message.content}
                      </div>
                    );
                  })
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
