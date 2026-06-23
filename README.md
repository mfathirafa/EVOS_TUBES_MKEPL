# Task Manager API

REST API sederhana untuk manajemen task, dibuat sebagai project demo pipeline CI/CD.
Dibangun dengan **Node.js + Express**, di-test dengan **Jest + Supertest**.

## Endpoint

| Method | URL | Deskripsi |
|--------|-----|-----------|
| GET | `/` | Health check API |
| GET | `/api/tasks` | Ambil semua task |
| POST | `/api/tasks` | Buat task baru |
| GET | `/api/tasks/:id` | Ambil task berdasarkan ID |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Hapus task |

## Menjalankan Secara Lokal

```bash
# Clone repo
git clone https://github.com/<USERNAME>/<REPO>.git
cd task-manager-api

# Install dependency
npm install

# Jalankan server
npm start
# → Server running on http://localhost:3000

# Jalankan test
npm test
```

---

## Pipeline CI/CD

### Struktur Workflow

```
Push/PR ke main
      │
      ├──► [1] CI     - Build & syntax check (Node 18 & 20 paralel)
      ├──► [2] CT     - Unit test + coverage report
      └──► [3] Inspect- CodeQL security analysis

Push ke main (CI + CT lolos)
      │
      └──► [4] CD Delivery  - Package ZIP → tunggu approval manual (env: staging)
                                   │
                          [Reviewer approve]
                                   │
                         GitHub Release dipublish
                                   │
                          [5] CD Deployment  - Build Docker → push ke GHCR (otomatis)
```

### Pembagian Tugas Anggota

| Anggota | File Workflow | Komponen |
|---------|--------------|---------|
| Anggota 1 | `.github/workflows/1-ci.yml` | Continuous Integration |
| Anggota 2 | `.github/workflows/2-ct.yml` | Continuous Testing |
| Anggota 3 | `.github/workflows/3-inspection.yml` | Continuous Inspection (CodeQL) |
| Anggota 4 | `.github/workflows/4-cd-delivery.yml` | Continuous Delivery |
| Anggota 5 | `.github/workflows/5-cd-deployment.yml` | Continuous Deployment |

---

## Setup GitHub yang Diperlukan (Lakukan Sekali)

### 1. Aktifkan CodeQL (Anggota 3)
Tidak perlu setup tambahan — CodeQL gratis untuk repo publik dan langsung aktif.
Hasil scan muncul di: **Security → Code scanning alerts**

### 2. Buat Environment "staging" (Anggota 4)
Diperlukan agar workflow CD Delivery punya gerbang approval manual.

1. Buka repo di GitHub → **Settings** → **Environments**
2. Klik **New environment** → nama: `staging`
3. Centang **Required reviewers**
4. Tambahkan username minimal 1 anggota kelompok sebagai reviewer
5. Klik **Save protection rules**

### 3. Aktifkan GitHub Container Registry (Anggota 5)
Tidak perlu setup tambahan — GHCR menggunakan `GITHUB_TOKEN` bawaan GitHub.
Pastikan repo dalam keadaan **Public** agar image bisa di-pull tanpa login.

---

## Skenario Demo (Sukses & Gagal)

Instruksi tugas mewajibkan demonstrasi PR **sukses** dan PR **gagal**.
Berikut cara membuat masing-masing:

### Demo Gagal — CI (Anggota 1)
Buat branch baru, masukkan syntax error ke `src/app.js`:

```bash
git checkout -b demo/ci-fail
# Edit src/app.js → tambahkan baris ini di baris pertama:
#   const broken = (
# (kurung buka tanpa kurung tutup = syntax error)
git add . && git commit -m "demo: intentional syntax error"
git push origin demo/ci-fail
# Buka Pull Request ke main → lihat job 'build' merah di tab Actions
```

### Demo Gagal — CT (Anggota 2)
Rusak satu assertion di test:

```bash
git checkout -b demo/ct-fail
# Edit __tests__/tasks.test.js → cari baris:
#   expect(res.status).toBe(201);
# Ubah menjadi:
#   expect(res.status).toBe(999);  // angka yang pasti salah
git add . && git commit -m "demo: broken test assertion"
git push origin demo/ct-fail
# Buka Pull Request ke main → lihat job 'test' merah
```

### Demo Sukses (Semua Anggota)
Buat PR normal (perubahan kecil di README atau tambah task baru di test):

```bash
git checkout -b demo/success
echo "# Update" >> README.md
git add . && git commit -m "feat: update readme"
git push origin demo/success
# Buka Pull Request → semua check hijau
```

### Demo CD — Delivery & Approval (Anggota 4)
1. Merge PR ke main
2. Buka tab Actions → lihat workflow "4 - Continuous Delivery"
3. Job kedua (`Create GitHub Release`) akan **pause** menunggu approval
4. Klik notifikasi review → Approve → job lanjut → GitHub Release terbuat

### Demo CD — Deployment (Anggota 5)
1. Setelah Release dipublish (dari langkah Anggota 4)
2. Workflow "5 - Continuous Deployment" otomatis jalan
3. Buka tab Actions → lihat proses build & push Docker
4. Buka **Packages** di halaman repo → image tersedia di GHCR

---

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js 4
- **Testing**: Jest 29 + Supertest 6
- **CI/CD**: GitHub Actions
- **Inspection**: CodeQL (JavaScript)
- **Container**: Docker → GitHub Container Registry (GHCR)
