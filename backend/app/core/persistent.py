"""
持久化存储配置

用于 Render 免费套餐的 SQLite 数据库持久化存储。

使用方法：
1. 在 Render Dashboard 中为服务添加持久化磁盘（SSD，最小 1GB）
2. 挂载路径设置为：/opt/render/project
3. 数据库文件将保存在：/opt/render/project/xinqing.db
4. 重启后数据不会丢失
"""

import os
from pathlib import Path

# ============================================
# 持久化存储路径
# ============================================

# Render 持久化存储根目录
PERSISTENT_DIR = Path("/opt/render/project")

# 开发环境（本地开发）的存储路径
# 如果不在 Render 环境中，使用项目根目录下的 data 目录
if not PERSISTENT_DIR.exists():
    PERSISTENT_DIR = Path(__file__).parent.parent / "data"

# 确保目录存在
PERSISTENT_DIR.mkdir(parents=True, exist_ok=True)

# ============================================
# 数据库文件路径
# ============================================

# SQLite 数据库文件路径
DATABASE_FILE = PERSISTENT_DIR / "xinqing.db"

# 数据库 URL
DATABASE_URL = f"sqlite:///{DATABASE_FILE}"

# ============================================
# 上传文件存储路径
# ============================================

# 上传文件根目录
UPLOAD_DIR = PERSISTENT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# 语音文件存储
AUDIO_DIR = UPLOAD_DIR / "audio"
AUDIO_DIR.mkdir(exist_ok=True)

# 图片文件存储
IMAGE_DIR = UPLOAD_DIR / "images"
IMAGE_DIR.mkdir(exist_ok=True)

# ============================================
# 日志文件路径
# ============================================

# 日志目录
LOG_DIR = PERSISTENT_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

# 日志文件路径
LOG_FILE = LOG_DIR / "app.log"
ERROR_LOG_FILE = LOG_DIR / "error.log"

# ============================================
# 数据库初始化
# ============================================

def init_database():
    """
    初始化数据库
    
    如果数据库文件不存在，创建它
    """
    if not DATABASE_FILE.exists():
        DATABASE_FILE.touch()
        print(f"✅ 数据库文件创建成功：{DATABASE_FILE}")
    else:
        print(f"✅ 数据库文件已存在：{DATABASE_FILE}")

def get_database_url():
    """
    获取数据库 URL
    
    Returns:
        str: 数据库 URL
    """
    return DATABASE_URL

def get_database_path():
    """
    获取数据库文件路径
    
    Returns:
        Path: 数据库文件路径
    """
    return DATABASE_FILE

# ============================================
# 文件路径工具函数
# ============================================

def get_upload_path(file_type: str, filename: str) -> Path:
    """
    获取上传文件的存储路径
    
    Args:
        file_type: 文件类型 ('audio' 或 'image')
        filename: 文件名
    
    Returns:
        Path: 完整的文件存储路径
    """
    if file_type == "audio":
        return AUDIO_DIR / filename
    elif file_type == "image":
        return IMAGE_DIR / filename
    else:
        return UPLOAD_DIR / filename

# ============================================
# 环境信息
# ============================================

def get_environment_info():
    """
    获取环境信息
    
    Returns:
        dict: 环境信息
    """
    return {
        "persistent_dir": str(PERSISTENT_DIR),
        "database_file": str(DATABASE_FILE),
        "database_url": DATABASE_URL,
        "upload_dir": str(UPLOAD_DIR),
        "log_dir": str(LOG_DIR),
        "is_render": os.environ.get("RENDER", "") == "true",
    }

if __name__ == "__main__":
    # 打印环境信息
    print("========================================")
    print("持久化存储配置信息")
    print("========================================")
    print()
    
    info = get_environment_info()
    for key, value in info.items():
        print(f"{key}: {value}")
    
    print()
    print("========================================")
    print("初始化数据库...")
    print("========================================")
    init_database()
