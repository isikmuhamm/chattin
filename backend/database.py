from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sqlalchemy.orm

# PostgreSQL bağlantı URL'i
SQLALCHEMY_DATABASE_URL = "postgresql://chattin:1234@localhost/chattin_db"

""" CREATE DATABASE chattin_db;
CREATE USER chattin WITH PASSWORD '1234';
ALTER ROLE chattin SET client_encoding TO 'utf8';
ALTER ROLE chattin SET default_transaction_isolation TO 'read committed';
ALTER ROLE chattin SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE chattin_db TO chattin; """


# Veritabanı motoru
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_size=10, max_overflow=20)

# SessionLocal sınıfı, veritabanı oturumlarını oluşturmak için kullanılır
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLAlchemy Base sınıfı, tüm modellerin temelini oluşturur
Base = sqlalchemy.orm.declarative_base()

# public şeması için:
Base.metadata.schema = 'public'

# Bağlantı fonksiyonu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
