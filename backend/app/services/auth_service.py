"""
认证服务 - JWT 生成与密码加密
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.database import get_db
from ..models.models import AdminUser, User

# 密码加密上下文
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

# Bearer Token 认证
security = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    return pwd_context.hash(password)


def ensure_default_admin_user(db: Session) -> AdminUser:
    """确保存在默认管理员账号。"""
    admin = (
        db.query(AdminUser)
        .filter(AdminUser.username == settings.ADMIN_BOOTSTRAP_USERNAME)
        .first()
    )
    if admin:
        if verify_password("admin123", admin.password_hash):
            admin.password_hash = get_password_hash(settings.ADMIN_BOOTSTRAP_PASSWORD)
            db.commit()
            db.refresh(admin)
        return admin

    admin = AdminUser(
        username=settings.ADMIN_BOOTSTRAP_USERNAME,
        password_hash=get_password_hash(settings.ADMIN_BOOTSTRAP_PASSWORD),
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建 JWT Token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """解码 JWT Token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """获取当前用户（可选，用于游客模式）"""
    if not credentials:
        return None

    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        return None

    user_id: int = payload.get("sub")
    if user_id is None:
        return None

    user = db.query(User).filter(User.id == user_id).first()
    return user


async def get_current_user_required(
    user: Optional[User] = Depends(get_current_user)
) -> User:
    """获取当前用户（必须登录）"""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登录或 Token 已过期",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_admin_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[AdminUser]:
    """获取当前管理员。"""
    if not credentials:
        return None

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("scope") != "admin":
        return None

    admin_id = payload.get("sub")
    if admin_id is None:
        return None

    return db.query(AdminUser).filter(AdminUser.id == int(admin_id)).first()


async def get_current_admin_user_required(
    admin_user: Optional[AdminUser] = Depends(get_current_admin_user)
) -> AdminUser:
    """获取当前管理员（必须登录）。"""
    if admin_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="管理员未登录或 Token 已过期",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return admin_user
