# 나라장터 프로젝트 Docker 배포 가이드

## 📋 프로젝트 개요
나라장터 입찰 공고 자동 분석 및 제안서 초안 생성 시스템을 Docker로 컨테이너화하여 배포하는 가이드입니다.

## 🏗️ 아키텍처
- **단일 Docker 이미지**: 모든 서비스가 하나의 이미지에 포함
- **멀티 서비스**: 3개의 독립적인 서비스가 각각 다른 포트에서 실행
  - **MySQL Database**: 포트 3306
  - **Backend API**: 포트 8002 
  - **Frontend React**: 포트 3000

---

## 📁 프로젝트 구조
```
나라장터/
├── backend/                 # Node.js + TypeScript API 서버
│   ├── src/
│   │   ├── config/         # DB, TypeORM 설정
│   │   ├── controllers/    # API 컨트롤러
│   │   ├── entities/       # TypeORM 엔티티
│   │   ├── repositories/   # 데이터 액세스 계층
│   │   ├── routes/         # API 라우트
│   │   ├── services/       # 비즈니스 로직
│   │   └── server.ts       # 서버 진입점
│   ├── package.json
│   └── .env               # 환경변수
├── frontend/              # React + TypeScript 클라이언트
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── db/                    # MySQL 설정 및 스크립트
│   ├── mysql-8.0.35-winx64/
│   ├── mysql-data/
│   ├── schema.sql
│   └── start-mysql.bat
└── docker-deployment-guide.md
```

---

## 🔧 현재 구축 상태 (2025-08-27 기준)

### ✅ 완료된 기능
#### Database (MySQL)
- MySQL 8.0.35 설치 완료
- `narajangter` 데이터베이스 생성
- 기본 테이블 스키마 구축 (users, roles, refresh_tokens 등)
- Connection Pool 설정

#### Backend (Node.js + Express)
- TypeScript 기반 Express 서버
- **포트**: 8002
- **주요 기능**:
  - JWT 기반 인증 시스템
  - 사용자 관리 (회원가입, 로그인)
  - 공고 관리 REST API
  - TypeORM을 통한 데이터베이스 연동
  - MySQL2와 TypeORM 병행 사용

#### Frontend (React + Vite)
- TypeScript 기반 React 앱
- **포트**: 3000 (예상)
- Vite 개발 서버

### 📊 주요 API 엔드포인트
```
Base URL: http://localhost:8002

[인증]
POST /api/auth/login      # 로그인
POST /api/auth/refresh    # 토큰 갱신

[관리자]
GET  /api/admin/users     # 사용자 목록
PUT  /api/admin/users/:id # 사용자 수정

[공고 관리]
GET  /api/announcements              # 모든 공고 조회
GET  /api/announcements/stats        # 공고 통계
GET  /api/announcements/active       # 활성 공고
GET  /api/announcements/search?q=    # 공고 검색
POST /api/announcements             # 공고 생성 (인증 필요)

[헬스체크]
GET  /healthz            # 서버 상태 확인
```

---

## 🐳 Docker 배포 설정

### Dockerfile
```dockerfile
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# MySQL 설치 (Alpine Linux 기준)
RUN apk add --no-cache mysql mysql-client

# 시스템 패키지 업데이트 및 필요한 도구 설치
RUN apk update && apk add --no-cache \
    bash \
    curl \
    supervisor

# 프로젝트 전체 복사
COPY . .

# Backend 의존성 설치
WORKDIR /app/backend
RUN npm install
RUN npm run build

# Frontend 의존성 설치 및 빌드
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# MySQL 데이터 디렉토리 설정
WORKDIR /app
RUN mkdir -p /var/lib/mysql
RUN mkdir -p /var/log/mysql
RUN chown -R mysql:mysql /var/lib/mysql /var/log/mysql

# Supervisor 설정 파일 복사
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 포트 노출
EXPOSE 3306 8002 3000

# 스타트업 스크립트 실행
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
```

### Docker Compose (docker-compose.yml)
```yaml
version: '3.8'

services:
  narajangter-app:
    build: .
    container_name: narajangter-system
    ports:
      - "3306:3306"   # MySQL
      - "8002:8002"   # Backend API
      - "3000:3000"   # Frontend
    environment:
      - NODE_ENV=production
      - DB_HOST=localhost
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=
      - DB_NAME=narajangter
    volumes:
      - mysql_data:/var/lib/mysql
      - ./logs:/app/logs
    restart: unless-stopped

volumes:
  mysql_data:
```

### Supervisor 설정 (docker/supervisord.conf)
```ini
[supervisord]
nodaemon=true
user=root

[program:mysql]
command=mysqld --user=mysql --datadir=/var/lib/mysql
autostart=true
autorestart=true
user=mysql
stdout_logfile=/var/log/supervisor/mysql.log
stderr_logfile=/var/log/supervisor/mysql_error.log

[program:backend]
command=node /app/backend/dist/server.js
directory=/app/backend
autostart=true
autorestart=true
user=root
environment=NODE_ENV=production
stdout_logfile=/var/log/supervisor/backend.log
stderr_logfile=/var/log/supervisor/backend_error.log

[program:frontend]
command=npm run preview
directory=/app/frontend
autostart=true
autorestart=true
user=root
stdout_logfile=/var/log/supervisor/frontend.log
stderr_logfile=/var/log/supervisor/frontend_error.log
```

### 시작 스크립트 (docker/start.sh)
```bash
#!/bin/bash

# MySQL 초기화 (첫 실행시)
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MySQL database..."
    mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql
fi

# MySQL 설정 파일 복사
cp /app/db/my.cnf /etc/mysql/my.cnf

# 데이터베이스 스키마 로드 (MySQL이 시작된 후)
/usr/bin/supervisord &

# MySQL이 시작될 때까지 대기
while ! mysqladmin ping -h localhost --silent; do
    sleep 1
done

# 데이터베이스 초기화
mysql -u root < /app/db/schema.sql || echo "Schema already exists"

# 모든 프로세스가 실행되도록 대기
wait
```

---

## 🚀 Docker 빌드 및 실행 명령어

### 이미지 빌드
```bash
# 프로젝트 루트에서 실행
docker build -t narajangter-system:latest .
```

### 컨테이너 실행
```bash
# Docker Compose 사용 (권장)
docker-compose up -d

# 또는 직접 실행
docker run -d \
  --name narajangter-system \
  -p 3306:3306 \
  -p 8002:8002 \
  -p 3000:3000 \
  narajangter-system:latest
```

### 컨테이너 관리
```bash
# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 컨테이너 중지
docker-compose down

# 데이터 볼륨까지 삭제
docker-compose down -v
```

---

## 🔍 배포 후 확인사항

### 서비스 상태 확인
```bash
# 헬스체크 API
curl http://localhost:8002/healthz

# 공고 API 테스트  
curl http://localhost:8002/api/announcements/stats

# Frontend 접속
http://localhost:3000
```

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose logs

# 개별 서비스 로그
docker exec narajangter-system tail -f /var/log/supervisor/backend.log
docker exec narajangter-system tail -f /var/log/supervisor/mysql.log
```

---

## 📝 환경변수 설정

### 필수 환경변수
```env
# 서버 설정
NODE_ENV=production
PORT=8002

# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=narajangter
DB_CONNECTION_LIMIT=10

# JWT 보안
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# CORS 설정
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🛠️ 개발자 참고사항

### 현재 구현된 주요 컴포넌트
- **TypeORM 엔티티**: User, Announcement, AnnouncementFile, AnalysisResult, ProposalDraft, UserActivityLog
- **Repository 패턴**: 데이터 액세스 계층 추상화
- **JWT 인증**: 액세스/리프레시 토큰 기반 인증
- **Connection Pool**: MySQL2와 TypeORM 동시 사용

### 향후 구현 예정
- [x] ~~마이그레이션 시스템~~ ✅ **완료**
- [x] ~~CRUD 로직 완성~~ ✅ **완료** (공고 관리 API)
- [ ] 나라장터 API 연동
- [ ] HuggingFace 모델 연동
- [ ] 파일 다운로드 및 분석
- [ ] HWP 파일 생성

---

## 📋 업데이트 이력
- **2025-08-27**: 초기 Docker 구축 가이드 작성
- **2025-08-27**: Backend API 서버 및 TypeORM 설정 완료
- **2025-08-27**: 공고 관리 REST API 구현 완료
- **2025-08-27**: TypeORM 마이그레이션 시스템 구축 완료
- **2025-08-27**: 샘플 데이터 생성 및 전체 API 테스트 완료

---

> **주의**: 이 가이드는 프로젝트 변경사항에 따라 지속적으로 업데이트됩니다.
> 최신 상태를 확인한 후 Docker 배포를 진행하시기 바랍니다.