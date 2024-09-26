from fastapi import FastAPI, Depends, APIRouter, WebSocket, HTTPException
from sqlalchemy.orm import Session
import crud, models, database, auth
from database import SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm


app = FastAPI()
router = APIRouter()
app.include_router(router)

# Veritabanı bağlantısı için bağımlılık
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# Veritabanı tabanını oluştur (ilk başlatmada kullan)
models.Base.metadata.create_all(bind=database.engine)


# CORS ayarları (isteğe bağlı)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # İzin verilen kaynaklar
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Karşılama
@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}

# Kullanıcı kaydı
@app.post("/users/", response_model=crud.UserCreate)
def create_user(user: crud.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

#Tüm kullanıcıları listeleme
@app.get("/users/", response_model=list[crud.UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = crud.get_users(db=db)
    return users


#Kullanıcı adına göre kullanıcı arama
@app.get("/users/{username}", response_model=crud.UserResponse)
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user.username, "id": user.id}  # Kullanıcı bilgilerini döndür


#Mesaj gönder
@app.post("/messages/")
def send_message(message: crud.MessageCreate, db: Session = Depends(get_db)):
    return crud.create_chat_message(
        db=db,
        sender_id=message.sender_id,
        receiver_id=message.recipient_id,
        content=message.content
    )


#Oturum açma
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password",
        )
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.id,  # Bu kısmı ekleyin
        "username": user.username  # Bu kısmı ekleyin
    }


# WebSocket üzerinden mesajlaşma
@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message received: {data}")


# Kullanıcının daha önce mesajlaştığı kullanıcıları döndüren endpoint
@app.get("/users/chat/")
async def get_chat_users(user_id: int = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return crud.get_chat_users(db=db, user_id=user_id)


# Geçmiş mesajlaşmaları al
@app.get("/messages/{target_user_id}")
def get_messages(target_user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    messages = crud.get_chat_messages(db=db, current_user_id=current_user.id, target_user_id=target_user_id)
    return {"messages": messages}