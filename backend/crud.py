from sqlalchemy.orm import Session
import models, auth
from pydantic import BaseModel
from fastapi import HTTPException, status
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str  # Parola alanını ekleyin

class UserResponse(BaseModel):
    username: str
    id: int

class TokenRequest(BaseModel):
    username: str
    password: str

class MessageCreate(BaseModel):
    sender_id: int  # Gönderen kullanıcının ID'si
    recipient_id: int  # Alıcı kullanıcının ID'si
    content: str  # Mesaj içeriği
    timestamp: datetime = None  # İsteğe bağlı zaman damgası

# Kullanıcıyı oluştur
def create_user(db: Session, user: UserCreate):
    # Kullanıcı adının zaten mevcut olup olmadığını kontrol et
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kullanıcı adı zaten mevcut.")

    hashed_password = auth.get_password_hash(user.password)  # Şifreyi hash'le
    db_user = models.User(username=user.username, password=hashed_password)  # Kullanıcıyı oluştur
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Kullanıcıyı bul
def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

# Tüm kullanıcıları bul
def get_users(db: Session):
    return db.query(models.User).all() 




# Bir mesaj gönder
def create_chat_message(db: Session, sender_id: int, receiver_id: int, content: str):
    chat_message = models.ChatMessage(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content,
        timestamp=datetime.now()  # Zaman damgasını ekliyoruz
    )
    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)
    return chat_message



def get_chat_users(db: Session, user_id: int):
    # Mesajları al ve en son mesajı dikkate alarak kullanıcıları gruplandır
    messages = (
        db.query(models.ChatMessage)
        .filter(
            (models.ChatMessage.sender_id == user_id) | 
            (models.ChatMessage.receiver_id == user_id)
        )
        .order_by(models.ChatMessage.timestamp.desc())  # Zaman damgasına göre sıralama
        .all()
    )
    
    # Kullanıcıları bir set içinde saklayarak tekrarlamayı önleyelim
    user_ids = set()
    result = []

    for message in messages:
        if message.sender_id == user_id:
            other_user_id = message.receiver_id
        else:
            other_user_id = message.sender_id
        
        if other_user_id not in user_ids:
            user_ids.add(other_user_id)
            # Diğer kullanıcının bilgilerini alalım
            other_user = db.query(models.User).filter(models.User.id == other_user_id).first()
            if other_user:
                result.append({"username": other_user.username, "id": other_user.id})

    return result  # En yeni mesajı gönderenler en başta olmak üzere, kullanıcı bilgileri döner



# Kullanıcılar arasındaki tüm mesajları listele
def get_chat_messages(db: Session, current_user_id: int, target_user_id: int):
    return db.query(models.ChatMessage).filter(
        ((models.ChatMessage.sender_id == current_user_id) & (models.ChatMessage.receiver_id == target_user_id)) |
        ((models.ChatMessage.sender_id == target_user_id) & (models.ChatMessage.receiver_id == current_user_id))
    ).all()

