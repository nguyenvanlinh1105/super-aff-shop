# QUY TRÌNH TRIỂN KHAI VÀ CI/CD RELEASE PRODUCTION (PRIVATE REPO)

> **Mục tiêu**: Hướng dẫn chi tiết từng bước (Step-by-step) từ lúc chuẩn bị VPS, cấu hình DNS Nhân Hòa, thiết lập quyền truy cập cho **Private Repository**, đến thiết lập **CI/CD tự động cập nhật khi Push / Merge vào nhánh `master`** cho dự án **MeowBack** (`https://meowback.shop`).

---

## TỔNG QUAN LUỒNG VẬN HÀNH

```mermaid
flowchart TD
    subgraph Internet ["🌐 Người dùng & Tên miền"]
        DNS["Nhân Hòa DNS (meowback.shop)<br/>Bản ghi A -> IP VPS"]
        User["Khách hàng truy cập HTTPS"]
    end

    subgraph GitHub ["🐙 GitHub (Private Repository)"]
        Repo["Repo: nguyenvanlinh1105/super-aff-shop (Private)"]
        MasterBranch["Nhánh: master<br/>(Push hoặc Merge PR)"]
        GHA["GitHub Actions (deploy.yml)"]
    end

    subgraph VPS ["🖥️ Máy chủ VPS (Ubuntu 22.04 / 24.04)"]
        DeployKey["SSH Deploy Key<br/>(Quyền tải Private Repo)"]
        Nginx["Nginx Reverse Proxy<br/>SSL Certbot HTTPS"]
        DockerApp["Docker: Next.js App (:3000)"]
        DockerDB["Docker: PostgreSQL 16 (Nội bộ)"]
        VolumeData["Volume lưu ảnh & Bill"]
    end

    DNS --> Nginx
    User --> Nginx
    Nginx --> DockerApp
    DockerApp <--> DockerDB
    DockerApp --> VolumeData

    MasterBranch -->|Kích hoạt tự động| GHA
    GHA -->|SSH vào VPS| VPS
    VPS -->|Git fetch bằng Deploy Key| Repo
```

---

## MỤC LỤC TỪNG BƯỚC

- [Bước 0: Trỏ IP VPS vào tên miền tại Nhân Hòa Dashboard](#bước-0-trỏ-ip-vps-vào-tên-miền-tại-nhân-hòa-dashboard)
- [Bước 1: Chuẩn bị máy chủ VPS (Cài đặt Docker, Nginx, Swap)](#bước-1-chuẩn-bị-máy-chủ-vps)
- [Bước 2: Cấp quyền cho VPS tải Private Repository (SSH Deploy Key)](#bước-2-cấp-quyền-cho-vps-tải-private-repository-ssh-deploy-key)
- [Bước 3: Tải mã nguồn & Tự tạo file `.env` trên VPS](#bước-3-tải-mã-nguồn--tự-tạo-file-env-trên-vps)
- [Bước 4: Khởi chạy lần đầu với Docker Compose & Database](#bước-4-khởi-chạy-lần-đầu-với-docker-compose--database)
- [Bước 5: Cấu hình Nginx & Kích hoạt chứng chỉ SSL HTTPS](#bước-5-cấu-hình-nginx--kích-hoạt-chứng-chỉ-ssl-https)
- [Bước 6: Thiết lập CI/CD tự động khi Push / Merge nhánh `master`](#bước-6-thiết-lập-cicd-tự-động-khi-push--merge-nhánh-master)
- [Bước 7: Các lệnh quản trị & Kiểm tra log thường dùng](#bước-7-các-lệnh-quản-trị--kiểm-tra-log-thường-dùng)

---

## BƯỚC 0: TRỎ IP VPS VÀO TÊN MIỀN TẠI NHÂN HÒA DASHBOARD

> **Giải thích**: Docker trên VPS **không thể** tự khai báo với thế giới mạng rằng tên miền `meowback.shop` thuộc về VPS. Bạn **BẮT BUỘC** phải lấy **IP Public của VPS** (do nhà cung cấp VPS gửi qua email cho bạn) gán vào bản ghi `A` trên Nhân Hòa.

1. Đăng nhập trang quản trị tên miền tại **Nhân Hòa** (`quanly.nhanhoa.com`).
2. Vào **Quản lý tên miền** -> Chọn **meowback.shop** -> Chọn **Cấu hình DNS** / **Quản lý DNS**.
3. Thêm **2 bản ghi** sau:

| Tên bản ghi (Host)    | Loại (Type)          | Giá trị (Value / IP VPS)                          | TTL | Mục đích                               |
| :-------------------- | :------------------- | :------------------------------------------------ | :-- | :------------------------------------- |
| `@` _(hoặc để trống)_ | **A**                | `IP_PUBLIC_CỦA_VPS` _(ví dụ: 103.179.x.x)_        | 300 | Trỏ `https://meowback.shop` về VPS     |
| `www`                 | **A** _(hoặc CNAME)_ | `IP_PUBLIC_CỦA_VPS` _(hoặc CNAME: meowback.shop)_ | 300 | Trỏ `https://www.meowback.shop` về VPS |

4. **Kiểm tra**: Mở Terminal trên máy tính của bạn gõ:
   ```bash
   ping meowback.shop
   ```
   Khi thấy kết quả trả về đúng địa chỉ IP của VPS là DNS đã thông!

---

## BƯỚC 1: CHUẨN BỊ MÁY CHỦ VPS

### 1.1. Kết nối vào VPS qua SSH

```bash
ssh root@<IP_VPS_CỦA_BẠN>
# Nhập mật khẩu VPS
```

### 1.2. Cập nhật hệ thống & Cài Docker, Git, Nginx

Chạy toàn bộ các lệnh sau trên VPS:

```bash
# Cập nhật packages
sudo apt update && sudo apt upgrade -y

# Cài đặt các công cụ cơ bản & Nginx
sudo apt install -y git curl ufw fail2ban nginx certbot python3-certbot-nginx

# Cài đặt Docker & Docker Compose chính thức
curl -fsSL https://get.docker.com | sh

# Kiểm tra phiên bản
docker --version
docker compose version
```

### 1.3. Tạo Swap 2GB (Tránh nghẽn RAM khi build mã nguồn)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Kiểm tra dung lượng RAM & Swap
free -h
```

### 1.4. Bật Firewall UFW bảo vệ máy chủ

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

_(Cổng PostgreSQL 5432 tuyệt đối không mở ra ngoài, chỉ container nội bộ mới được giao tiếp)._

---

## BƯỚC 2: CẤP QUYỀN CHO VPS TẢI PRIVATE REPOSITORY (SSH DEPLOY KEY)

> Vì repository của bạn là **Private**, nếu dùng `git clone https://...` sẽ bị hỏi tài khoản/mật khẩu và bị từ chối. Cách chuẩn nhất là dùng **SSH Deploy Key** (an toàn tuyệt đối, cấp quyền vĩnh viễn cho máy chủ VPS).

### 2.1. Tạo SSH Key trên VPS

Chạy lệnh sau trên VPS (nhấn `Enter` qua các câu hỏi):

```bash
ssh-keygen -t ed25519 -C "vps-meowback-deploy" -f ~/.ssh/id_ed25519 -N ""
```

### 2.2. Lấy nội dung Public Key

```bash
cat ~/.ssh/id_ed25519.pub
```

Màn hình sẽ in ra một đoạn ký tự, bắt đầu bằng `ssh-ed25519 AAAA... vps-meowback-deploy`. **Hãy bôi đen và copy toàn bộ đoạn này**.

### 2.3. Gán Public Key vào GitHub Repository

1. Mở trình duyệt, truy cập GitHub Repo: `https://github.com/nguyenvanlinh1105/super-aff-shop`
2. Vào **Settings** (ở thanh menu trên của repo).
3. Ở cột menu bên trái, tìm và bấm vào mục **Deploy keys**.
4. Bấm nút **Add deploy key** (màu xanh lá):
   - **Title**: `VPS Production Key`
   - **Key**: Dán đoạn mã vừa copy ở Bước 2.2 vào đây.
   - _(Không cần tích "Allow write access" vì VPS chỉ cần quyền đọc mã nguồn)._
5. Bấm nút **Add key**.

### 2.4. Kiểm tra kết nối từ VPS tới GitHub

Quay lại cửa sổ SSH của VPS, gõ lệnh:

```bash
ssh -T git@github.com
```

_(Nếu hỏi `Are you sure you want to continue connecting (yes/no)?`, gõ `yes` rồi Enter)._
Màn hình xuất hiện thông báo:

> `Hi nguyenvanlinh1105/super-aff-shop! You've successfully authenticated, but GitHub does not provide shell access.`
> 👉 **Chúc mừng, VPS của bạn đã được GitHub cấp quyền tải mã nguồn Private vô điều kiện!**

---

## BƯỚC 3: TẢI MÃ NGUỒN & TỰ TẠO FILE `.ENV` TRÊN VPS

### 3.1. Clone mã nguồn về VPS

```bash
# Tạo thư mục chạy web
sudo mkdir -p /var/www/meowback
sudo chown -R $USER:$USER /var/www/meowback
cd /var/www/meowback

# Clone mã nguồn bằng SSH (Không bao giờ hỏi mật khẩu)
git clone git@github.com:nguyenvanlinh1105/super-aff-shop.git .
```

### 3.2. Tự tạo file `.env` chứa thông số cấu hình thật của bạn

```bash
nano .env
```

Dán toàn bộ các thông số môi trường của bạn vào. Các thông số cốt lõi:

```env
# 1. Cơ sở dữ liệu nội bộ Docker (Đặt mật khẩu tùy ý của bạn)
POSTGRES_DB=meowback_shop
POSTGRES_USER=meowuser
POSTGRES_PASSWORD=MatKhauBaoMatCuaBan2026!

# Chuỗi kết nối Database nội bộ giữa App và Postgres
DATABASE_URL="postgresql://meowuser:MatKhauBaoMatCuaBan2026!@postgres:5432/meowback_shop?schema=public"

# 2. Cấu hình Domain & Bảo mật Session
NEXT_PUBLIC_APP_URL="https://meowback.shop"
SESSION_SECRET="chuoi_ngau_nhien_dai_it_nhat_32_ky_tu_bao_mat"

# 3. Các API Keys của bạn (Shopee, Telegram, Gmail SMTP, Google OAuth...)
# Tự dán tiếp các cấu hình thực tế của bạn vào đây...
```

_Nhấn `Ctrl + O` -> `Enter` để lưu, sau đó nhấn `Ctrl + X` để thoát._

---

## BƯỚC 4: KHỞI CHẠY LẦN ĐẦU VỚI DOCKER COMPOSE & DATABASE

Tại thư mục `/var/www/meowback`:

### 4.1. Build và khởi chạy các container

```bash
docker compose up -d --build
```

> Quá trình build lần đầu sẽ đóng gói Next.js 14 Standalone và tải Postgres 16 (mất khoảng 2 - 3 phút).

### 4.2. Kiểm tra trạng thái

```bash
docker compose ps
```

Khi thấy cả 2 container `meowback_app` và `meowback_db` đều ở trạng thái **Up / healthy** là ứng dụng đã chạy.

### 4.3. Khởi tạo cấu trúc Database (Prisma Migrate)

```bash
docker compose exec app npx prisma migrate deploy
```

### 4.4. (Tùy chọn) Nạp dữ liệu khởi tạo (Admin mẫu & Platform)

```bash
docker compose exec app npm run prisma:seed
```

---

## BƯỚC 5: CẤU HÌNH NGINX & KÍCH HOẠT CHỨNG CHỈ SSL HTTPS

### 5.1. Tạo cấu hình Reverse Proxy trên Nginx

File này **không tự động sinh ra**. Bạn hãy tạo bằng 1 trong 2 cách sau:

#### Cách 1: Chạy 1 lệnh duy nhất (Khuyên dùng - Nhanh nhất, không sợ gõ sai)

Copy toàn bộ khối lệnh dưới đây, dán vào Terminal VPS và bấm `Enter`:

```bash
sudo tee /etc/nginx/sites-available/meowback.shop << 'EOF'
server {
    listen 80;
    server_name meowback.shop www.meowback.shop;

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

        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }
}
EOF
```

#### Cách 2: Dùng trình soạn thảo Nano thủ công

1. Mở tạo file:
   ```bash
   sudo nano /etc/nginx/sites-available/meowback.shop
   ```
2. Copy đoạn cấu hình `server { ... }` ở trên và chuột phải dán vào terminal.
3. Bấm **`Ctrl + O`** -> Bấm **`Enter`** để lưu.
4. Bấm **`Ctrl + X`** để thoát ra ngoài.

### 5.2. Kích hoạt site và kiểm tra cú pháp Nginx

```bash
sudo ln -s /etc/nginx/sites-available/meowback.shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5.3. Cấp chứng chỉ SSL HTTPS miễn phí (Certbot Let's Encrypt)

```bash
sudo certbot --nginx -d meowback.shop -d www.meowback.shop
```

_Nhập email của bạn và chọn `Y` đồng ý điều khoản. Certbot sẽ tự động gắn SSL và kích hoạt tự gia hạn trọn đời._

👉 **Kiểm tra ngay**: Mở trình duyệt và truy cập: **`https://meowback.shop`**

---

## BƯỚC 6: THIẾT LẬP CI/CD TỰ ĐỘNG KHI PUSH / MERGE NHÁNH `MASTER`

Hệ thống đã có sẵn file workflow [.github/workflows/deploy.yml](file:///d:/Workspaces/PET/Suppershop/super-shop/.github/workflows/deploy.yml).

### 6.1. Chuẩn bị SSH Key để GitHub Actions có quyền kết nối vào VPS

Để máy chủ GitHub Actions kết nối được vào VPS của bạn qua SSH:

1. **Trên VPS**, kiểm tra file `~/.ssh/authorized_keys`:
   Nếu bạn đang đăng nhập VPS bằng SSH Key cá nhân từ máy tính, chỉ cần lấy **Private Key** của key đó.
   Hoặc nếu bạn muốn tạo 1 SSH Key riêng cho GitHub Actions, chạy lệnh này ngay trên VPS:

   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key -N ""

   # Thêm public key vào danh sách được phép đăng nhập VPS
   cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys

   # In Private Key ra màn hình để copy
   cat ~/.ssh/github_actions_key
   ```

   **Copy toàn bộ nội dung** từ `-----BEGIN OPENSSH PRIVATE KEY-----` đến `-----END OPENSSH PRIVATE KEY-----`.

### 6.2. Cấu hình GitHub Secrets trên Repo

1. Mở GitHub Repo: **Settings** -> **Secrets and variables** -> **Actions**.
2. Bấm nút **New repository secret** và thêm lần lượt **4 Secrets**:

| Secret Name   | Value                                            | Ghi chú                       |
| :------------ | :----------------------------------------------- | :---------------------------- |
| `VPS_HOST`    | Địa chỉ IP Public của VPS                        | Ví dụ: `103.179.x.x`          |
| `VPS_USER`    | Tên đăng nhập SSH của VPS                        | Thường là `root`              |
| `VPS_SSH_KEY` | Toàn bộ nội dung Private Key vừa copy ở Bước 6.1 | Bắt đầu bằng `-----BEGIN ...` |
| `VPS_PORT`    | `22`                                             | Cổng SSH mặc định             |

---

### 6.3. Quy trình Release tự động hoạt động như thế nào?

Từ bây giờ:

1. Khi bạn **push trực tiếp** lên nhánh `master`:
   ```bash
   git push origin master
   ```
2. Hoặc khi bạn tạo Pull Request và bấm **Merge** vào nhánh `master` trên GitHub:
3. **GitHub Actions sẽ tự động chạy ngầm**:
   - Kết nối SSH bảo mật vào VPS.
   - Dùng SSH Deploy Key kéo mã nguồn mới nhất từ nhánh `master`.
   - Chạy `docker compose up -d --build app` để build lại bản web mới.
   - Chạy `docker compose exec -T app npx prisma migrate deploy` để cập nhật bảng mới nếu có.
   - Dọn dẹp image rác cũ để giữ ổ cứng VPS luôn sạch sẽ.
4. Bạn chỉ cần vào tab **Actions** trên GitHub để xem trạng thái hoàn tất tích xanh `✓` (thời gian khoảng 1 - 2 phút).

---

## BƯỚC 7: CÁC LỆNH QUẢN TRỊ & KIỂM TRA LOG THƯỜNG DÙNG

### 1. Xem log hoạt động theo thời gian thực

```bash
# Xem log của Web Next.js
docker compose -f /var/www/meowback/docker-compose.yml logs -f app

# Xem log của Database PostgreSQL
docker compose -f /var/www/meowback/docker-compose.yml logs -f postgres
```

### 2. Khởi động lại / Dừng hệ thống

```bash
cd /var/www/meowback
# Khởi động lại toàn bộ
docker compose restart

# Dừng hệ thống
docker compose down

# Khởi chạy lại
docker compose up -d
```

### 3. Kết nối Database từ máy tính cá nhân bằng A5:SQL Mk-2 qua SSH Tunnel

Vì cổng `5432` không mở ra ngoài Internet, bạn dùng **SSH Tunnel**:

- Trên máy tính của bạn, mở PowerShell / Terminal:
  ```bash
  ssh -L 5432:127.0.0.1:5432 -N root@<IP_VPS>
  ```
- Mở **A5:SQL Mk-2** hoặc **DBeaver**:
  - **Host**: `127.0.0.1` | **Port**: `5432`
  - **Database**: `meowback_shop`
  - **User**: `meowuser`
  - **Password**: Mật khẩu bạn đặt ở `POSTGRES_PASSWORD` trong file `.env` trên VPS.
