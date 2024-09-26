from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt # type: ignore
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext # type: ignore

SECRET_KEY = "your_secret_key"  # Değiştir
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8000/token")


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Kullanıcı doğrulama
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub") # Burada kullanıcı ID'sini alıyoruz
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user_id # Kullanıcı ID'sini döndür

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # Şifre hashing için bir konteks oluştur

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password) #Verilen şifreyi hash'le.

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password) #Plain (düz) şifreyi, hash'lenmiş şifre ile doğrula.