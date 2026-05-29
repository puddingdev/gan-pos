# PROJECT OVERVIEW

โปรเจกต์นี้คือ POS ร้านน้ำ/น้ำชง/โซดา/ไอติมขนาดเล็ก ใช้ส่วนตัวสำหรับร้านหน้าบ้าน

เป้าหมาย:

* ใช้งานจริงบน iPad และมือถือ
* เร็ว
* เรียบง่าย
* ใช้งานมือเดียวได้
* ไม่ overengineer
* ทำให้เสร็จและ deploy ได้จริง

IMPORTANT:
ห้ามสร้างระบบ enterprise
ห้ามเพิ่ม complexity เกินจำเป็น
ทุกอย่างต้อง prioritize simplicity และ usability

---

# CORE STACK

Frontend:

* Next.js
* TailwindCSS
* TypeScript

Backend:

* Google Apps Script API

Database:

* Google Sheets

Deployment:

* Vercel (frontend)
* Google Apps Script Web App (backend)

IMPORTANT:
ห้ามเปลี่ยน tech stack เอง
ห้ามเพิ่ม database ใหม่
ห้ามเพิ่ม auth system
ห้ามเพิ่ม websocket
ห้ามเพิ่ม prisma
ห้ามเพิ่ม docker

---

# DESIGN RULES

UI style:

* minimal cafe POS
* clean
* warm
* modern
* rounded corners
* large touch targets
* mobile first
* optimized for iPad landscape

Primary colors:

* cream
* coffee brown
* soft beige

Font:

* IBM Plex Sans Thai
* Noto Sans Thai

IMPORTANT:
ห้ามใช้ neon colors
ห้ามทำ UI futuristic
ห้ามใช้ tiny buttons
ห้ามทำ dashboard ซับซ้อน

---

# PRODUCT SCOPE

Current scope:

* drink menu
* soda menu
* basic ice cream support
* size selection
* toppings
* cart
* checkout with change calculation
* order history
* sales today
* menu management
* stock tracking per product
* profit/loss calculation (requires costPrice per product)

NOT IN SCOPE:

* employee system
* inventory management
* accounting
* online ordering
* kitchen display
* real-time sync
* multi-store
* advanced analytics

IMPORTANT:
ถ้าฟีเจอร์ไม่อยู่ใน scope อย่าทำเพิ่มเอง

---

# UX RULES

IMPORTANT:
POS ต้องกดได้เร็ว

Target:

* เพิ่มสินค้าใน 1-2 tap
* checkout ภายในไม่กี่วินาที
* ปุ่มต้องใหญ่
* spacing ต้องโล่ง
* ห้าม clutter

Always prioritize:

1. speed
2. readability
3. touch usability
4. simplicity

Never prioritize:

* fancy animation
* complex layouts
* overdesigned visuals

---

# RESPONSIVE RULES

Primary target:

* iPad landscape

Secondary:

* mobile portrait

IMPORTANT:
Desktop ไม่ใช่ priority

---

# FILE STRUCTURE RULES

Keep project structure simple.

Preferred:

* components/
* app/
* lib/
* types/
* services/

IMPORTANT:
ห้ามสร้าง architecture enterprise
ห้ามแยกไฟล์เล็กเกินจำเป็น
ห้าม over-abstraction

---

# CODING RULES

* Keep components simple
* Reuse UI patterns
* Avoid premature optimization
* Avoid unnecessary state management
* Prefer local state when possible
* Keep code readable

IMPORTANT:
ห้ามเพิ่ม Redux
ห้ามเพิ่ม Zustand ถ้ายังไม่จำเป็น
ห้ามเพิ่ม complex patterns

---

# DATA RULES

Google Sheets acts as database.

Data must remain:

* simple
* editable manually
* understandable by non-developers

IMPORTANT:
ห้าม normalize database ซับซ้อนเกินจำเป็น

---

# DEVELOPMENT PRIORITY

Build order:

1. POS layout
2. menu grid
3. cart
4. size selection
5. toppings
6. checkout
7. order save
8. sales today
9. menu management

IMPORTANT:
ทำทีละส่วน
อย่ากระโดดไปทำระบบใหญ่ก่อน

---

# ENVIRONMENT SETUP

## .env.local
```
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

หากไม่ตั้งค่า `NEXT_PUBLIC_GAS_URL` แอปจะทำงานในโหมดตัวอย่างด้วยข้อมูล mock

## Google Sheets Structure

**Sheet "Products"** (columns A–H):
```
id | name | category | price | costPrice | stock | unit | available
```
- `stock = -1` = ไม่จำกัด
- `available = TRUE/FALSE`

**Sheet "Orders"** (columns A–I):
```
id | date | itemsSummary | total | totalCost | profit | paymentMethod | amountPaid | change
```

## Google Apps Script Deployment

1. ไปที่ [script.google.com](https://script.google.com) → สร้างโปรเจกต์ใหม่
2. วาง code จากไฟล์ `gas/Code.gs` ทับ code เดิมทั้งหมด
3. แก้ `SS_ID` ให้ตรงกับ Google Sheet ID ของคุณ (จาก URL ของ Sheet)
4. รัน `setupSheets()` ครั้งแรกเพื่อสร้าง headers และ sample data
5. Deploy → New deployment → Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
6. คัดลอก Deployment URL → ใส่ใน `.env.local` เป็น `NEXT_PUBLIC_GAS_URL`

## Development

```bash
npm run dev      # http://localhost:3000
```

ใช้งานได้โดยไม่ต้องมี GAS URL (โหมดตัวอย่าง)

---

# FILE MAP

```
types/index.ts          — TypeScript interfaces (Product, CartItem, Order, etc.)
services/api.ts         — Google Apps Script API client
gas/Code.gs             — GAS backend script (deploy ที่ script.google.com)

app/page.tsx            — หน้าหลัก POS (menu grid + cart)
app/admin/page.tsx      — หน้าจัดการร้าน (เมนู / สต็อก / รายได้)

components/pos/
  MenuGrid.tsx          — กริดเมนูสินค้า
  CartPanel.tsx         — รายการในตะกร้า
  CheckoutModal.tsx     — Modal ชำระเงิน + คิดเงินทอน

components/admin/
  MenuManagement.tsx    — เพิ่ม/แก้ไข/เปิด-ปิดเมนู
  StockPanel.tsx        — จัดการ stock สินค้า
  SalesReport.tsx       — รายงานกำไร/ขาดทุนวันนี้
```

---

# FINAL GOAL

This is a small real-world cafe POS.

The goal is:

* usable
* stable
* fast
* beautiful enough
* easy to maintain

NOT:

* startup SaaS
* enterprise POS
* complex platform
