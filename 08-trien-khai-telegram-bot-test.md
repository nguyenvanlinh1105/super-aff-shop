# Trien khai Telegram Bot test that

## 1. Muc tieu

Bot Telegram se chay song song voi web:

- Nguoi dung gui link Shopee/TikTok vao bot
- Bot tra ve short link cua he thong
- He thong luu tracking code, short code, sub_id
- Sau nay import CSV Shopee de doi soat hoa hong
- Nguoi dung co the go `/wallet` de xem so du tam tinh

## 2. Bien moi truong can co

Cap nhat file `.env`:

```env
NEXT_PUBLIC_APP_URL="https://ten-domain-public-cua-ban"
SHOPEE_AFFILIATE_ID="17303870157"
TELEGRAM_BOT_TOKEN="token-tu-botfather"
TELEGRAM_WEBHOOK_SECRET="mot-secret-ngan-de-kiem-tra"
```

## 3. Tao bot

1. Mo Telegram, chat voi `@BotFather`
2. Gui lenh `/newbot`
3. Dat ten bot
4. Dat username ket thuc bang `bot`
5. Lay `TELEGRAM_BOT_TOKEN`

## 4. URL webhook

Neu domain public cua he thong la:

```text
https://scalded-chaos-bullish.ngrok-free.dev
```

thi webhook la:

```text
https://scalded-chaos-bullish.ngrok-free.dev/api/telegram/webhook
```

Co the test GET:

```text
https://scalded-chaos-bullish.ngrok-free.dev/api/telegram/webhook?secret=mot-secret-ngan-de-kiem-tra
```

Neu dung, he thong tra JSON `ok: true`.

## 5. Dang ky webhook voi Telegram

Mo trinh duyet:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://ten-domain-public/api/telegram/webhook
```

Neu thanh cong, Telegram se tra `{"ok":true,...}`.

## 6. Cau hinh trong admin

Vao trang:

```text
/admin/telegram
```

Nhap:

- Ten bot
- Bot username
- Token hint de ghi nho
- Webhook URL
- Bat trang thai `active`

## 7. Cac lenh da ho tro

- `/start`
- `/help`
- `/wallet`
- Gui truc tiep link Shopee hoac TikTok

## 8. Luong test that

1. Chay web bang domain public
2. Tao bot va set webhook
3. Vao Telegram, chat voi bot
4. Gui `/start`
5. Gui 1 link Shopee
6. Bot se tra short link
7. Bam short link tren dien thoai
8. Mua test 1 don nho
9. Doi CSV Shopee
10. Import vao he thong
11. Kiem tra `Sub_id2 = trackingCode` map dung ve khach

## 9. Ghi chu van hanh

- Telegram phu hop hon Zalo cho bot full chuc nang
- Web van la trung tam quan tri, bot la kenh giao tiep
- Neu chua co token bot, webhook van log du lieu o che do simulated
- Neu short link con la `localhost` thi khong gui test tren may khac duoc
