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

1. Açılışta seed kullanıcılarla **giriş yapılır**. Demo şifresi tüm seed
   kullanıcılar için `123456` değeridir.
   - Saha: `busra@test.com`
   - Merkez: `admin@test.com`
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
> dosyasındadır (bazı prompt'ların tam metni, AI önerileri ve gerekçeler dahil). Aşağıdaki
> bölüm bu kaydın özeti niteliğindedir.

## Hangi yapay zeka araçlarını kullandınız?

- **Antigravity IDE** — Backend iskeleti, entity/DbContext ve Docker kurulumu (Aşama 1)
- **Cursor (Claude Sonnet / Composer)** — Service, controller, DTO ve middleware (Aşama 2)
- **Claude (chat)** — PostgreSQL sorguları (Aşama 3)
- **Cursor (Claude Opus)** — React Native / Expo frontend, seed ve kullanıcı seçimi (Aşama 4)
- **Cursor (Claude Opus / Composer)** — Teslim kriter kontrolü, Bölüm 5/6 şablonları, duplicate ziyaret, konum, filtre/sıralama ve UX iyileştirmeleri (Aşama 5)
- **Cursor (GPT-5.5)** — Proje iyileştirme planı, JWT auth, test altyapısı, müşteri modeli, pagination, offline queue ve README/log güncellemeleri (Aşama 6)
- **Gemini** — Proje kapsamını büyütme ve fikir alma aşamasında alternatif öneriler için kullanıldı.

## En faydalı bulduğum 5 prompt

1. **.NET 9 + PostgreSQL iskelet kurulumu** — Entity, enum, `AppDbContext`,
   `Program.cs`, CORS, Swagger ve `docker-compose.yml` aynı prompt içinde net
   tarif edildiği için backend temeli doğru kuruldu. (LOG-01)
2. **VisitService iş kuralları ve controller katmanı** — Create/update/approve
   kuralları, DTO'lar ve endpointler maddeler halinde verildiği için iş mantığı
   servis katmanında toplandı. (LOG-02)
3. **React Native UI/UX revizyonu** — Yalnızca yerleşik React Native bileşenleriyle
   kart tasarımı, status rozetleri, form validation, success overlay ve web uyumlu
   onay akışları geliştirildi. (LOG-04)
4. **Duplicate ziyaret ve konum senaryoları** — Aynı kullanıcı + müşteri + gün için
   unique constraint/service validation; ayrıca GPS + manuel adres desteği eklendi.
   (LOG-05)
5. **Proje iyileştirme ve büyütme planı** — Proje analiz edilerek JWT auth, rol bazlı
   yetkilendirme, test altyapısı, özel hata modeli, pagination, müşteri modeli ve
   offline queue aşamalı şekilde uygulandı. (LOG-06)

## Yapay zekanın önerdiği ancak kullanmadığım çözümler

- **SQL Soru 2 – LEFT JOIN alternatifi:** AI, `LEFT JOIN ... WHERE IS NULL`
  yaklaşımını da sundu. Okunabilirlik için `NOT IN` + subquery tercih edildi; büyük
  veri setlerinde LEFT JOIN'in performans avantajı bilinçli bir trade-off olarak
  not edildi.
- **NativeWind / Tailwind yığını:** UI önce NativeWind ile yapıldı; ancak "yalnızca
  yerleşik RN bileşenleri kullan" yönergesiyle `StyleSheet`'e taşındı ve ilgili
  paketler/config temizlendi (bundle 851 → ~473 modül).
- **Tam register/parola yönetimi akışı:** JWT login sonradan eklendi; ancak kullanıcı
  kayıt, parola sıfırlama ve parola değiştirme akışları case kapsamını büyüteceği için
  eklenmedi. Seed kullanıcılar demo şifresiyle kullanıldı.
- **Harita ve fotoğraf ekleme:** Proje büyütme planında önerildi; ancak temel güvenlik,
  test, müşteri modeli, pagination ve offline kayıt kuyruğu daha öncelikli olduğu için
  bu özellikler sonraki geliştirme aşamasına bırakıldı.

## Yapay zekanın yanlış yönlendirdiği noktalar

- **Bundling hatası kök nedeni:** "Cannot read properties of undefined (reading
  'transformFile')" hatasında ilk şüphe NativeWind'e yönelmişti; gerçek neden eksik
  `babel-preset-expo` paketiydi. Paket kurulunca çözüldü.
- **`Alert.alert` davranışı:** AI başta tüm platformlarda `Alert.alert` butonlu
  diyalogları önerdi; bunların react-native-web'de çalışmadığı tespit edilip web'de
  `window.confirm` / görünür kart butonları ile platform-uyumlu çözüme geçildi.
- **NuGet kaynak problemi:** Restore/build hatalarında sorun bazen paket versiyonu gibi
  yorumlandı; asıl sebep yerel makinedeki eski DevExpress offline feed'i ve bozuk/sandbox
  NuGet cache'ti. Proje içi `nuget.config` ve izole `.nuget/packages` kullanımıyla çözüldü.

## Hangi bölümleri yapay zeka kullanmadan geliştirdim?

Kod üretiminde AI yoğun kullanıldı; ancak aşağıdaki karar ve incelemeler manuel yapıldı:
- **Docker bağlantısı ve uygulamanın ayağa kaldırılması:** PostgreSQL container'ının
  çalıştırılması, migration'ların uygulanması, backend/frontend'in yerelde test edilmesi
  ve ortam değişkenlerinin ayarlanması.
- **GitHub entegrasyonu:** Repository düzeni, dosya takibi, commit/branch kararları ve
  teslim için proje çıktılarının gözden geçirilmesi.
- **Bölüm 5 ve Bölüm 6 dokümanları:** `docs/bolum5-ai-iletisim.md` ve
  `docs/bolum6-kod-incelemesi.md` içerikleri manuel olarak düzenlendi; AI yalnızca
  şablon/fikir desteği sağladı.
- **İş mantığı kararları:** SQL Soru 4'te "onaylanmamış = Pending" yorumu, duplicate
  ziyaret kuralının kapsamı, konumun zorunlu tutulmaması ve manuel adres eklenmesi.
- **Mimari/ürün kararları:** Önce kullanıcı seçimiyle MVP akışını kurma, sonrasında JWT
  auth'a geçme; seed stratejisi, demo kullanıcı/şifre seçimi, müşteri modelinin aşamalı
  eklenmesi ve offline queue'nun ilk sürüm kapsamı.
- **Gözden geçirme ve kabul/ret kararları:** Üretilen kodların test edilmesi, kullanılmayan
  bağımlılıkların temizlenmesi, AI önerilerinin proje kapsamına göre kabul edilmesi veya
  sonraki aşamaya bırakılması.

## Bölüm 5 ve Bölüm 6

- **Bölüm 5 – AI ile İletişim Becerisi:** [docs/bolum5-ai-iletisim.md](docs/bolum5-ai-iletisim.md)
- **Bölüm 6 – AI Kod İncelemesi:** [docs/bolum6-kod-incelemesi.md](docs/bolum6-kod-incelemesi.md)

## AI Chat Geçmişi Linkleri

Aşağıdaki dosyalarda seçilmiş AI chat geçmişleri ve içerikleri yer almaktadır:

- [Controller implementasyonu chat geçmişi](docs/ai-chat-linkleri/cursor_visits_and_users_controller_impl.md)
- [Proje kriter değerlendirmesi chat geçmişi](docs/ai-chat-linkleri/cursor_project_criteria_evaluation.md)
- [Proje iyileştirme önerileri chat geçmişi](docs/ai-chat-linkleri/cursor_proje_iyile_tirme_nerileri.md)


