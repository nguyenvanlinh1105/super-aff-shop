# HƯỚNG DẪN TRIỂN KHAI MEOWBACK LÊN VPS VỚI DOCKER & CI/CD GITHUB ACTIONS

Tài liệu này cung cấp toàn bộ kiến trúc, phương án kỹ thuật và hướng dẫn từng bước để triển khai dự án **MeowBack (Next.js 14 + Prisma + PostgreSQL)** lên máy chủ ảo (VPS), cấu hình Reverse Proxy với Nginx/SSL và tự động hóa cập nhật (CI/CD) qua GitHub Actions.

---

## MỤC LỤC

1. [Phân tích kiến trúc: Docker vs Cài trực tiếp trên VPS](#1-phân-tích-kiến-trúc-docker-vs-cài-trực-tiếp-trên-vps)
2. [Chuẩn bị máy chủ VPS](#2-chuẩn-bị-máy-chủ-vps)
3. [Cấu hình mã nguồn & Docker](#3-cấu-hình-mã-nguồn--docker)
4. [Cấu hình Web Server Nginx & SSL HTTPS](#4-cấu-hình-web-server-nginx--ssl-https)
5. [Thiết lập quy trình CI/CD với GitHub Actions](#5-thiết-lập-quy-trình-cicd-với-github-actions)
6. [Quản trị, Giám sát & Sao lưu cơ sở dữ liệu](#6-quản-trị-giám-sát--sao-lưu-cơ-sở-dữ-liệu)
7. [Bảng kiểm tra (Checklist) trước khi Go-Live](#7-bảng-kiểm-tra-checklist-trước-khi-go-live)

---

## 1. PHÂN TÍCH KIẾN TRÚC: DOCKER VS CÀI TRỰC TIẾP TRÊN VPS

### 1.1. Bảng so sánh 2 phương án

| Hạng mục                | Phương án A: Docker Compose (Khuyến nghị)                                                           | Phương án B: Cài trực tiếp (Node.js + PM2 + Native Postgres)                   |
| :---------------------- | :-------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **Tính cách ly**        | **Cao**. Mỗi dịch vụ (App, DB) chạy độc lập, không làm rác hệ điều hành VPS.                        | **Thấp**. Thư viện, runtime cài lẫn lộn vào hệ điều hành chính.                |
| **Bảo mật Database**    | **Rất an toàn**. Postgres nằm hoàn toàn trong mạng nội bộ Docker, không mở cổng `5432` ra Internet. | Phải tự cấu hình `pg_hba.conf`, ufw firewall để chặn port `5432`.              |
| **Sao lưu & Di chuyển** | **Rất đơn giản**. Chuyển sang VPS khác chỉ cần copy thư mục và volume dữ liệu.                      | Phải cài đặt lại từ đầu từng phần mềm trên VPS mới.                            |
| **CI/CD**               | **Chuẩn hóa**. Build container trên GitHub Actions và kéo về VPS chạy.                              | Script SSH phải chạy nhiều lệnh dễ lỗi: pull, npm install, build, pm2 restart. |
| **Yêu cầu phần cứng**   | Tối thiểu **2GB RAM** (nếu 1GB RAM phải bật Swap 2GB - 4GB).                                        | Tối thiểu **1GB - 2GB RAM**.                                                   |

### 1.2. Kết luận lựa chọn

- **Chọn Docker Compose**: Toàn bộ hệ thống gói gọn trong 1 tệp cấu hình `docker-compose.yml`. Dễ kiểm soát môi trường dev/staging/prod đồng nhất, không lo lỗi phát sinh do khác biệt hệ điều hành.

---

## 2. CHUẨN BỊ MÁY CHỦ VPS

### 2.1. Cấu hình khuyến nghị

- **Hệ điều hành**: Ubuntu 22.04 LTS hoặc Ubuntu 24.04 LTS.
- **Cấu hình tối thiểu**: 1 vCPU, 2GB RAM, 25GB SSD (hoặc 1GB RAM nếu bật Swap 2GB).
- **Cấu hình lý tưởng**: 2 vCPU, 4GB RAM, 40GB SSD.

### 2.2. Tạo Swap RAM (Ngăn ngừa lỗi tràn bộ nhớ khi chạy nhiều tác vụ)

Chạy các lệnh sau với quyền `root` hoặc `sudo`:

```bash
# Tạo file swap 2GB (hoặc 4G nếu VPS 1GB RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Thiết lập tự động kích hoạt khi khởi động lại VPS
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Kiểm tra lại dung lượng RAM và Swap
free -h
```

### 2.3. Cài đặt Docker & Docker Compose

```bash
# Cập nhật package hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt các công cụ phụ trợ
sudo apt install -y curl git ufw fail2ban

# Cài đặt Docker chính thức từ script của Docker
curl -fsSL https://get.docker.com | sh

# Thêm quyền cho người dùng hiện tại (không cần gõ sudo khi dùng docker)
sudo usermod -aG docker $USER

# Kiểm tra phiên bản
docker --version
docker compose version
```

### 2.4. Cấu hình Firewall UFW (Bảo vệ máy chủ)

```bash
# Cho phép SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Kích hoạt Firewall
sudo ufw enable
sudo ufw status
```

> **Lưu ý quan trọng**: Cổng `5432` của PostgreSQL tuyệt đối **KHÔNG** mở trên UFW. Chỉ nội bộ container App mới được phép kết nối vào PostgreSQL.

---

## 3. CẤU HÌNH MÃ NGUỒN & DOCKER

### 3.1. Cập nhật `next.config.mjs`

Để Next.js tạo ra bundle siêu nhẹ (`standalone`), mở file [next.config.mjs](file:///d:/Workspaces/PET/Suppershop/super-shop/next.config.mjs) và bổ sung:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Bật chế độ standalone tối ưu cho Docker
  // các cấu hình hiện tại giữ nguyên...
};

export default nextConfig;
```

### 3.2. Tạo file `Dockerfile`

Tạo file `Dockerfile` tại thư mục gốc của dự án:

```dockerfile
# ─── BƯỚC 1: MÔI TRƯỜNG CƠ SỞ ───
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# ─── BƯỚC 2: CÀI ĐẶT THƯ VIỆN ───
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ─── BƯỚC 3: XÂY DỰNG ỨNG DỤNG (BUILD) ───
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Sinh mã Prisma Client cho môi trường Linux
RUN npx prisma generate

# Xây dựng ứng dụng Next.js
RUN npm run build

# ─── BƯỚC 4: RUNNER SIÊU NHẸ ĐỂ CHẠY PRODUCTION ───
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Tạo user an toàn không dùng root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Sao chép các thư mục tĩnh và kết quả standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### 3.3. Tạo file `.dockerignore`

Tạo file `.dockerignore` tại thư mục gốc:

```
node_modules
.next
.git
.vscode
.claude
*.log
.env*.local
storage/temp
test_vid
video_recordings
```

### 3.4. Tạo file `docker-compose.yml`

File này được đặt trên thư mục triển khai trên VPS (ví dụ: `/var/www/meowback/docker-compose.yml`):

```yaml
version: "3.8"

services:
  # 1. Cơ sở dữ liệu PostgreSQL
  postgres:
    image: postgres:16-alpine
    container_name: meowback_db
    restart: always
    environment:
      POSTGRES_DB: meowback
      POSTGRES_USER: meowuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "127.0.0.1:5432:5432" # Chỉ lắng nghe trên localhost VPS để SSH Tunnel vào quản trị (A5:SQL Mk-2, DBeaver)
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - meow_internal_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U meowuser -d meowback"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. Ứng dụng MeowBack Next.js
  app:
    image: ghcr.io/${GITHUB_REPOSITORY}:latest
    container_name: meowback_app
    restart: always
    ports:
      - "127.0.0.1:3000:3000" # Chỉ bind vào localhost của VPS, Nginx sẽ làm reverse proxy
    environment:
      DATABASE_URL: "postgresql://meowuser:${DB_PASSWORD}@postgres:5432/meowback?schema=public"
      NODE_ENV: production
      NEXT_PUBLIC_APP_URL: "https://meowback.shop"
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - meow_internal_net

volumes:
  pgdata:
    driver: local

networks:
  meow_internal_net:
    driver: bridge
```

---

## 4. CẤU HÌNH WEB SERVER NGINX & SSL HTTPS

Nginx sẽ đứng ngoài máy chủ VPS, nhận các request từ Internet gửi tới domain `meowback.shop` và chuyển hướng vào ứng dụng Next.js đang chạy tại cổng `3000`.

### 4.1. Cài đặt Nginx & Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 4.2. Tạo file cấu hình Nginx

File này **không tự động sinh ra**. Bạn cần tạo file bằng 1 trong 2 cách sau:

#### Cách 1: Chạy 1 lệnh duy nhất (Khuyên dùng - Nhanh nhất, không sợ sai sót)

Bạn chỉ cần copy toàn bộ đoạn lệnh dưới đây và dán thẳng vào Terminal VPS rồi nhấn `Enter`. Lệnh sẽ tự động tạo file và ghi toàn bộ nội dung cấu hình vào:

```bash
sudo tee /etc/nginx/sites-available/meowback.shop << 'EOF'
server {
    listen 80;
    server_name meowback.shop www.meowback.shop;

    # Cấu hình kích thước upload tối đa (dành cho upload hóa đơn/bill đối soát)
    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout cho các API đồng bộ dữ liệu nặng
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
    }
}
EOF
```

#### Cách 2: Tạo bằng trình soạn thảo Nano thủ công

1. Gõ lệnh mở tạo file:
   ```bash
   sudo nano /etc/nginx/sites-available/meowback.shop
   ```
2. Copy đoạn cấu hình `server { ... }` ở trên và chuột phải dán vào cửa sổ Terminal.
3. Nhấn tổ hợp phím **`Ctrl + O`** -> Nhấn **`Enter`** để lưu file.
4. Nhấn tổ hợp phím **`Ctrl + X`** để thoát ra ngoài.

### 4.3. Kích hoạt và cấp phát chứng chỉ SSL Let's Encrypt

```bash
# Tạo symlink kích hoạt site
sudo ln -s /etc/nginx/sites-available/meowback.shop /etc/nginx/sites-enabled/

# Kiểm tra cú pháp cấu hình Nginx
sudo nginx -t

# Khởi động lại Nginx
sudo systemctl restart nginx

# Tự động xin chứng chỉ SSL và cấu hình HTTPS
sudo certbot --nginx -d meowback.shop -d www.meowback.shop
```

> Certbot sẽ tự động tạo cron job gia hạn SSL mỗi khi chứng chỉ sắp hết hạn (miễn phí trọn đời).

---

## 5. THIẾT LẬP QUY TRÌNH CI/CD VỚI GITHUB ACTIONS

### 5.1. Luồng vận hành (Workflow)

1. Bạn commit và đẩy code lên branch `main` trên GitHub.
2. Máy chủ **GitHub Actions Runner** (miễn phí) sẽ tải mã nguồn, tự động build Docker Image.
3. GitHub Actions đẩy Docker Image hoàn thiện lên **GitHub Container Registry (`ghcr.io`)**.
4. GitHub Actions kết nối qua **SSH** vào máy chủ VPS và kích hoạt script:
   - Đăng nhập và kéo image mới nhất về.
   - Chạy `docker compose up -d app`.
   - Tự động chạy `npx prisma migrate deploy` để đồng bộ cơ sở dữ liệu nếu có bảng/cột mới.
   - Xóa các image cũ để giải phóng ổ cứng.
5. **Toàn bộ quá trình diễn ra tự động trong khoảng 2 - 3 phút, người dùng truy cập web không bị gián đoạn.**

---

### 5.2. Cấu hình SSH Key để GitHub Actions truy cập VPS

Tại máy tính cá nhân hoặc trên VPS, tạo một cặp khóa SSH riêng biệt cho CI/CD:

```bash
# Tạo SSH Key mới
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# Thêm Public Key vào danh sách cho phép trên VPS
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 5.3. Cấu hình GitHub Secrets

Truy cập kho mã nguồn trên GitHub: **Settings -> Secrets and variables -> Actions -> New repository secret**:

- `VPS_HOST`: Địa chỉ IP của VPS (ví dụ: `103.x.x.x`).
- `VPS_USER`: Tên đăng nhập SSH của VPS (ví dụ: `ubuntu` hoặc `root`).
- `VPS_SSH_KEY`: Nội dung toàn bộ file private key `~/.ssh/github_deploy_key`.
- `VPS_PORT`: Cổng SSH (mặc định là `22`).

---

### 5.4. File cấu hình GitHub Actions Workflow

Tạo file tại đường dẫn: `.github/workflows/deploy.yml`

```yaml
name: Deploy MeowBack to VPS

on:
  push:
    branches:
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Kiểm tra mã nguồn (Checkout)
        uses: actions/checkout@v4

      - name: Thiết lập Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Đăng nhập vào GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build và đẩy Docker Image lên GHCR
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Triển khai tới VPS qua SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          script: |
            set -e
            cd /var/www/meowback

            # Đăng nhập GHCR trên VPS để kéo private image
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

            # Kéo image mới
            docker compose pull app

            # Khởi động lại container app với phiên bản mới
            docker compose up -d app

            # Tự động cập nhật Database schema nếu có migration mới
            docker compose exec -T app npx prisma migrate deploy

            # Dọn dẹp các Docker image cũ để tiết kiệm dung lượng ổ cứng
            docker image prune -f
```

---

## 6. QUẢN TRỊ, GIÁM SÁT & SAO LƯU CƠ SỞ DỮ LIỆU

### 6.1. Các lệnh vận hành thông dụng trên VPS

#### A. Quản trị Docker & Ứng dụng (Next.js & Database)

```bash
# Di chuyển vào thư mục dự án
cd /var/www/meowback

# Xem trạng thái hoạt động của các container (App, Database)
docker compose ps

# Xem log theo thời gian thực của ứng dụng Next.js
docker compose logs -f app

# Xem log của cơ sở dữ liệu PostgreSQL
docker compose logs -f postgres

# Khởi động lại các container
docker compose restart

# Dừng toàn bộ hệ thống container
docker compose down

# Bật lại hệ thống container chạy nền
docker compose up -d
```

#### B. Quản trị Web Server Nginx & SSL HTTPS

```bash
# Kiểm tra trạng thái hoạt động của Nginx
sudo systemctl status nginx

# Kiểm tra cú pháp file cấu hình Nginx (xem có bị lỗi dấu chấm phẩy hay sai cú pháp không)
sudo nginx -t

# Tải lại cấu hình Nginx mà không làm gián đoạn web (Zero-downtime reload)
sudo systemctl reload nginx

# Khởi động lại Nginx
sudo systemctl restart nginx

# Xem log lỗi của Nginx (rất hữu ích khi gặp lỗi 502 Bad Gateway)
sudo tail -f /var/log/nginx/error.log

# Xem log truy cập của khách hàng theo thời gian thực
sudo tail -f /var/log/nginx/access.log

# Kiểm tra thời hạn các chứng chỉ SSL Certbot
sudo certbot certificates

# Chạy thử kiểm tra tự động gia hạn SSL Let's Encrypt
sudo certbot renew --dry-run
```

#### C. Giám sát tài nguyên máy chủ VPS (RAM, CPU, Ổ cứng)

```bash
# Xem dung lượng RAM và Swap còn trống
free -h

# Xem dung lượng ổ cứng SSD còn trống
df -h

# Theo dõi mức sử dụng CPU & RAM theo thời gian thực (nhấn 'q' để thoát)
htop
```

### 6.2. Thiết lập tự động sao lưu Database hàng ngày (Automated Backup)

Tạo script backup tại `/var/www/meowback/backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/meowback_postgres"
mkdir -p $BACKUP_DIR

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/meowback_backup_$TIMESTAMP.sql.gz"

# Chạy pg_dump bên trong container và nén gzip
docker exec -t meowback_db pg_dump -U meowuser meowback | gzip > $BACKUP_FILE

# Tự động xóa các bản sao lưu cũ hơn 14 ngày
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +14 -delete

echo "Sao lưu hoàn tất: $BACKUP_FILE"
```

Cấp quyền thực thi và đưa vào CronTab của VPS:

```bash
chmod +x /var/www/meowback/backup_db.sh

# Mở crontab để thêm lịch chạy 2h00 sáng mỗi ngày
sudo crontab -e
```

Thêm dòng sau vào cuối file crontab:

```cron
0 2 * * * /var/www/meowback/backup_db.sh >> /var/log/db_backup.log 2>&1
```

### 6.3. Hướng dẫn kết nối Database bằng A5:SQL Mk-2 qua SSH Tunnel

Để xem dữ liệu, truy vấn SQL, debug hoặc quản trị Database từ máy tính cá nhân bằng công cụ **A5:SQL Mk-2** (hoặc DBeaver, TablePlus, Navicat), bạn **không cần mở port 5432 ra Internet**. Thay vào đó, hãy dùng **SSH Tunnel (Port Forwarding)** để đảm bảo an toàn tuyệt đối.

#### Cách 1: Thiết lập SSH Tunnel bằng dòng lệnh (PowerShell / CMD trên Windows)

1. Mở PowerShell hoặc CMD trên máy tính của bạn và chạy lệnh sau:

   ```powershell
   # Nếu dùng SSH Key:
   ssh -L 5432:127.0.0.1:5432 -N -i "C:\path\to\your_private_key" username@IP_VPS

   # Hoặc nếu dùng mật khẩu VPS:
   ssh -L 5432:127.0.0.1:5432 -N username@IP_VPS
   ```

   _(Giải thích: Lệnh này sẽ tạo một đường hầm mã hóa, ánh xạ cổng 5432 trên máy tính của bạn thẳng vào cổng 5432 của PostgreSQL trên VPS. Cửa sổ này giữ mở khi đang làm việc)._

2. Mở **A5:SQL Mk-2** trên máy tính:
   - Chọn **Database** -> **Connect** -> **Add**.
   - Chọn RDBMS: **PostgreSQL**.
   - Nhập thông số kết nối:
     - **Server (Host)**: `127.0.0.1` hoặc `localhost`
     - **Port**: `5432`
     - **Database**: `meowback`
     - **User**: `meowuser`
     - **Password**: Mật khẩu bạn đặt ở biến `POSTGRES_PASSWORD` trong file `.env.production` trên VPS.
   - Bấm **Test Connection** -> Kết nối thành công! Bạn có thể xem bảng, chạy SQL và xuất dữ liệu bình thường.

#### Cách 2: Thiết lập SSH Tunnel bằng PuTTY (Giao diện đồ họa)

Nếu bạn hay dùng PuTTY:

1. Mở PuTTY, nhập IP VPS vào ô **Host Name**.
2. Ở thanh menu bên trái, tìm đến: **Connection** -> **SSH** -> **Tunnels**:
   - **Source port**: `5432`
   - **Destination**: `127.0.0.1:5432`
   - Bấm nút **Add**.
3. Quay lại mục **Session**, lưu lại cấu hình và bấm **Open** để đăng nhập SSH.
4. Mở A5:SQL Mk-2 và kết nối tới `localhost:5432` như Bước 2 ở Cách 1.

---

## 7. BẢNG KIỂM TRA (CHECKLIST) TRƯỚC KHI GO-LIVE

- [ ] **Domain**: Đã trỏ bản ghi `A` của `meowback.shop` và `www.meowback.shop` về IP của VPS.
- [ ] **Swap RAM**: Đã tạo tối thiểu 2GB Swap trên VPS.
- [ ] **Firewall**: UFW chỉ mở cổng `22`, `80`, `443`. Tuyệt đối không mở `5432`.
- [ ] **Môi trường (`.env.production`)**:
  - `DATABASE_URL` kết nối thông qua host nội bộ `postgres`.
  - `NEXT_PUBLIC_APP_URL="https://meowback.shop"`
  - `SESSION_SECRET` hoặc mã hóa JWT được đặt chuỗi ngẫu nhiên bảo mật cao.
  - Các khóa API Shopee, TikTok, Lazada đã được điền đầy đủ.
- [ ] **SSL**: Chứng chỉ HTTPS đã hoạt động bình thường trên trình duyệt.
- [ ] **CI/CD**: Đã thêm đầy đủ Secrets trên GitHub repository và test thử lần push đầu tiên.
- [ ] **Backup**: Script sao lưu cơ sở dữ liệu đã được thử nghiệm và nén thành công.
