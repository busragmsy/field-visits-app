# Saha Ziyaretleri Uygulaması (Field Visits App)

Bir saha ekibinin müşteri ziyaretlerini takip edebileceği basit bir uygulama.
Saha kullanıcıları ziyaret oluşturup kendi ziyaretlerini görüntüleyebilir; merkez
(admin) tüm ziyaretleri takip edip onaylayabilir veya reddedebilir.

## Teknolojiler

- **Backend:** .NET 9 Web API, Entity Framework Core (code-first)
- **Veritabanı:** PostgreSQL 16 (Docker)
- **Frontend:** React Native (Expo), React Navigation

## Proje Yapısı

```
field-visits-app/
├── FieldVisits.API/          # .NET 9 Web API
│   ├── Controllers/          # VisitsController, UsersController
│   ├── Services/             # IVisitService, VisitService (iş kuralları)
│   ├── Models/               # Entities, DTOs, Enums
│   ├── Data/                 # AppDbContext (+ seed kullanıcılar)
│   ├── Middleware/           # ExceptionMiddleware (anlamlı hata mesajları)
│   └── Migrations/
├── FieldVisitsApp/           # Expo / React Native uygulaması
│   ├── screens/              # UserSelect, VisitList, NewVisit, EditVisit
│   ├── components/           # DatePickerField, CalendarIcon
│   ├── context/              # UserContext (aktif kullanıcı)
│   └── services/api.js       # API istemcisi
├── sql/queries.sql           # Bölüm 2 PostgreSQL sorguları
├── docs/                     # Bölüm 5 ve Bölüm 6 cevapları
├── docker-compose.yml        # PostgreSQL servisi
└── AI_USAGE_LOG.md           # Tüm AI etkileşimlerinin ayrıntılı kaydı
```

## Kurulum ve Çalıştırma

### 1. Veritabanı (PostgreSQL)

```bash
docker compose up -d
```

PostgreSQL `localhost:5432` üzerinde `field_visits_db` veritabanıyla ayağa kalkar
(kullanıcı/şifre: `postgres` / `postgres`).

### 2. Backend (.NET 9 API)

```bash
cd FieldVisits.API
dotnet ef database update    # şemayı oluşturur ve seed kullanıcıları ekler
$env:ASPNETCORE_ENVIRONMENT="Development"   # PowerShell (Windows)
dotnet run
```

API `http://localhost:5000` adresinde çalışır. Swagger:
`http://localhost:5000/swagger` (yalnızca Development ortamında).

> `dotnet ef` aracı kurulu değilse: `dotnet tool install --global dotnet-ef`

### 3. Frontend (Expo)

```bash
cd FieldVisitsApp
npm install
npx expo start            # ardından: w (web), a (Android), i (iOS)
```

Frontend `http://localhost:5000/api` adresine bağlanır (`services/api.js`).

## Kullanım

1. Açılışta bir **kullanıcı seçilir** (giriş ekranı yerine hafif seçim; seed'li
   kullanıcılar listelenir).
2. **Saha kullanıcısı** seçilirse yalnızca kendi ziyaretleri ("Ziyaretlerim")
   görüntülenir; ziyaret oluşturup düzenleyebilir.
3. **Merkez (Admin)** seçilirse tüm ziyaretler ("Tüm Ziyaretler") görüntülenir ve
   onay/red işlemleri yapılabilir.

## Uygulanan İş Kuralları (Bölüm 1)

- Geçmiş tarihli ziyaret oluşturulamaz.
- `CustomerName` boş bırakılamaz.
- `Note` alanı en fazla 500 karakter olabilir.
- Hatalı isteklerde `ExceptionMiddleware` üzerinden anlamlı hata mesajı (`{ "error": "..." }`).
- Merkez ziyaretleri onaylayabilir/reddedebilir.
- Onaylanan ziyaretler kilitlenir (güncellenemez ve silinemez).

## API Uç Noktaları

| Metot  | Yol                          | Açıklama                          |
|--------|------------------------------|----------------------------------|
| GET    | `/api/visits`                | Tüm ziyaretler (merkez)          |
| GET    | `/api/visits/user/{userId}`  | Kullanıcının ziyaretleri         |
| POST   | `/api/visits`                | Yeni ziyaret oluştur             |
| PUT    | `/api/visits/{id}`           | Ziyaret güncelle                 |
| PATCH  | `/api/visits/{id}/status`    | Onayla / reddet                  |
| DELETE | `/api/visits/{id}`           | Ziyaret sil                      |
| GET    | `/api/users`                 | Kullanıcıları listele            |

## SQL Sorguları (Bölüm 2)

PostgreSQL sorguları [sql/queries.sql](sql/queries.sql) dosyasındadır:
1. En çok ziyaret yapan ilk 5 kullanıcı
2. Son 30 günde hiç ziyaret yapmayan kullanıcılar
3. Kullanıcı bazlı ziyaret raporu (ad, toplam ziyaret, son ziyaret tarihi)
4. Merkez tarafından onaylanmamış ziyaretler

## Diğer Bölümler

- **Bölüm 5 – AI ile İletişim Becerisi:** [docs/bolum5-ai-iletisim.md](docs/bolum5-ai-iletisim.md)
- **Bölüm 6 – AI Kod İncelemesi:** [docs/bolum6-kod-incelemesi.md](docs/bolum6-kod-incelemesi.md)

---

# AI Usage Report

> Tüm AI etkileşimlerinin ayrıntılı, zaman damgalı kaydı [AI_USAGE_LOG.md](AI_USAGE_LOG.md)
> dosyasındadır (prompt'ların tam metni, AI önerileri ve gerekçeler dahil). Aşağıdaki
> bölüm bu kaydın özetidir.

## Hangi yapay zeka araçlarını kullandınız?

- **Antigravity IDE** — Backend iskeleti, entity/DbContext ve Docker kurulumu (Aşama 1)
- **Cursor (Claude Sonnet / Composer)** — Service, controller, DTO ve middleware (Aşama 2)
- **Claude (chat)** — PostgreSQL sorguları (Aşama 3)
- **Cursor (Claude Opus)** — React Native / Expo frontend, seed ve kullanıcı seçimi (Aşama 4)

## En faydalı bulduğum 5 prompt

1. **.NET 9 + PostgreSQL iskelet kurulumu** — Klasör yapısı, entity'ler (enum'ların
   string saklanması, `DeleteBehavior.Restrict`), `AppDbContext`, `Program.cs` ve
   `docker-compose.yml` tek seferde net biçimde tarif edildi. (LOG-01)
2. **VisitService iş kuralları** — Her metot için iş kuralları (geçmiş tarih, boş
   `CustomerName`, 500 karakter `Note`, onaylanmış ziyaretin kilitlenmesi) madde
   madde verildiği için doğru üretildi. (LOG-02)
3. **PostgreSQL sorguları** — 4 raporlama sorgusu; alternatif yaklaşımlar ve
   performans notlarıyla birlikte. (LOG-03)
4. **Katı UI/UX, yalnızca yerleşik RN bileşenleri** — Ekstra kütüphane olmadan kart
   tasarımı, status rozetleri ve "onaylanmış ise kilitli" kuralının görselleştirmesi.
   (LOG-04, Prompt 6)
5. **Platforma uyumlu tarih seçici** — Web'de `<input type="date">`, native'de
   `datetimepicker`; `minimumDate` ve validation kurallarıyla. (LOG-04, Prompt 7)

## Yapay zekanın önerdiği ancak kullanmadığım çözümler

- **SQL Soru 2 – LEFT JOIN alternatifi:** AI, `LEFT JOIN ... WHERE IS NULL`
  yaklaşımını da sundu. Okunabilirlik için `NOT IN` + subquery tercih edildi; büyük
  veri setlerinde LEFT JOIN'in performans avantajı bilinçli bir trade-off olarak
  not edildi.
- **NativeWind / Tailwind yığını:** UI önce NativeWind ile yapıldı; ancak "yalnızca
  yerleşik RN bileşenleri kullan" yönergesiyle `StyleSheet`'e taşındı ve ilgili
  paketler/config temizlendi (bundle 851 → ~473 modül).
- **Tam kimlik doğrulama (login/register + JWT):** Hardcoded `USER_ID` için AI/öneri
  düzeyinde değerlendirildi; case kapsamı dışı ve maliyetli olduğu için bunun yerine
  hafif, rol bazlı **kullanıcı seçimi** uygulandı.

## Yapay zekanın yanlış yönlendirdiği noktalar

- **Bundling hatası kök nedeni:** "Cannot read properties of undefined (reading
  'transformFile')" hatasında ilk şüphe NativeWind'e yönelmişti; gerçek neden eksik
  `babel-preset-expo` paketiydi. Paket kurulunca çözüldü.
- **`Alert.alert` davranışı:** AI başta tüm platformlarda `Alert.alert` butonlu
  diyalogları önerdi; bunların react-native-web'de çalışmadığı tespit edilip web'de
  `window.confirm` / görünür kart butonları ile platform-uyumlu çözüme geçildi.

## Hangi bölümleri yapay zeka kullanmadan geliştirdim?

Kod üretiminde AI yoğun kullanıldı; ancak aşağıdaki karar ve incelemeler manuel yapıldı:
- **İş mantığı yorumları:** SQL Soru 4'te "onaylanmamış = Pending" yorumu ve join/filtre
  tercihleri.
- **Mimari kararlar:** Tam auth yerine rol bazlı kullanıcı seçimi; seed stratejisi ve
  veritabanının temiz yeniden kurulması.
- **Ortam müdahalesi:** Global NuGet çakışması (NU1301) için projeye özel `nuget.config`
  kuralının belirlenmesi.
- **Gözden geçirme/temizlik:** Üretilen kodun kabul/ret kararları ve kullanılmayan
  bağımlılıkların temizlenmesi.
