# AI Usage Log — Field Visits App

Bu dosya, projedeki her yapay zeka kullanımının gerçek zamanlı kaydıdır.
README'deki AI Usage Report bu dosyadan derlenecektir.

---

## KAYITLAR

### [LOG-01] | 20.06.2026 | Antigravity IDE | Aşama 1 — Scaffold ve Veritabanı Kurulumu

**Görev:** .NET 9 WebAPI projesinin temel iskeletini, entity'leri, DbContext'i ve Docker ortamını oluşturmak. Ardından yerel NuGet hatasını otonom olarak çözmek.

**Prompt 1 (İskelet):**
I need to scaffold a .NET 9 Web API + PostgreSQL backend for a field visit tracking app.

Tech stack:
- .NET 9 WebAPI
- PostgreSQL via Npgsql.EntityFrameworkCore.PostgreSQL
- Entity Framework Core with code-first migrations

Project structure I want:
FieldVisits.API/
├── Controllers/
├── Services/
├── Models/
│   ├── Entities/
│   ├── DTOs/
│   └── Enums/
├── Data/
├── Middleware/
└── Program.cs

Entities:
- User: Id (int), Name (string required max 200), Email (string required max 200),
  Role (enum: Field | Admin, stored as string)
- Visit: Id (int), UserId (int FK → User), CustomerName (string required max 200),
  VisitDate (DateOnly), Note (string? max 500), CreatedDate (DateTime UTC default),
  Status (enum: Pending | Approved | Rejected, stored as string),
  ApprovedAt (DateTime? nullable), ApprovedBy (int? nullable)

DbContext rules:
- Enums stored as strings in DB
- Visit.CustomerName required, max 200
- Visit.Note nullable, max 500
- User → Visit relationship: DeleteBehavior.Restrict
- No cascade delete

Program.cs needs:
- AddDbContext with Npgsql
- Connection string key: "DefaultConnection" from appsettings.Development.json
- AddCors policy named "AllowAll" (AllowAnyOrigin, AllowAnyMethod, AllowAnyHeader)
- Swagger only in Development environment
- No HTTPS redirect

Also create docker-compose.yml at project root (field-visits-app/) with:
- postgres:16 image
- POSTGRES_DB: field_visits_db
- POSTGRES_USER: postgres
- POSTGRES_PASSWORD: postgres
- Port: 5432:5432
- Named volume: postgres_data

Do NOT generate Controllers or Services yet.
Only create: folder structure, Enums, Entities, AppDbContext, Program.cs,
appsettings.Development.json (with connection string), docker-compose.yml

**Prompt 2 (Hata Çözümü):**
Projeyi derlemeye (build) çalışırken "NU1301: Local source 'C:\Program Files\DevExpress 24.1\Components\Offline Packages' doesn't exist" hatası alıyorum. Bu, bilgisayarımdaki eski bir global NuGet yapılandırmasından kaynaklanıyor.

Bunu çözmek ve projenin paket bağımlılıklarını izole etmek için aşağıdaki adımları sırasıyla uygula:

1. FieldVisits.API dizininin içine bir nuget.config dosyası oluştur.
2. Tüm global paket kaynaklarını devre dışı bırakmak (clear) ve paket kaynağı olarak yalnızca "nuget.org" (https://api.nuget.org/v3/index.json) adresini eklemek için gerekli XML yapılandırmasını bu dosyanın içine yaz.
3. Projenin başarıyla derlendiğini doğrulamak için FieldVisits.API dizini içinde dotnet clean ve ardından dotnet build komutlarını çalıştır.
4. Derleme (build) başarılı olduktan sonra, veritabanı şemasını PostgreSQL'e uygulamak için önce dotnet ef migrations add InitialCreate, ardından da dotnet ef database update komutlarını çalıştır.

**AI Önerisi:**
Antigravity, .NET 9 mimarisine uygun klasör yapısını, Entity'leri ve `docker-compose.yml` dosyasını oluşturdu. Derleme hatası alındığında otonom olarak projeye özel bir `nuget.config` yarattı ve PostgreSQL veritabanı için `InitialCreate` migration'ını çalıştırdı.

**Kullandım mı?** Evet

**Gerekçe:**
- **Kabul ettiklerim:** Ajanın oluşturduğu DbContext ve Code-First migration iskeleti teknik gereksinimleri tam karşılıyordu. Enum'ların string olarak tutulması kuralı başarılı şekilde uygulandı.
- **Değiştirdiklerim/Müdahaleler:** Bilgisayarımdaki global NuGet konfigürasyon çakışması (NU1301 hatası) nedeniyle projeyi izole etmek adına `nuget.config` eklenmesi yönünde manuel kural müdahalesi yapıldı.

**Sonuç:** Veritabanı Docker üzerinde sorunsuz ayağa kalktı. Migration uygulandı ve backend iskeleti tamamlandı.

---

### [LOG-02] | 20.06.2026 | Cursor (claude-sonnet-4-6, composer 2.5) | Aşama 2 — Service + Controller

**Görev:** DTO katmanı, VisitService iş kuralları, controller'lar ve ExceptionMiddleware yazımı.

**Prompt 1 (DTO'lar):**
Bu .NET 9 WebAPI projesinde Models/DTOs/ klasörüne aşağıdaki DTO'ları oluştur.

CreateVisitRequest.cs:
- UserId (int)
- CustomerName (string)
- VisitDate (DateOnly)
- Note (string?)

UpdateVisitRequest.cs:
- CustomerName (string)
- VisitDate (DateOnly)
- Note (string?)

VisitResponse.cs:
- Id (int)
- UserId (int)
- CustomerName (string)
- VisitDate (DateOnly)
- Note (string?)
- CreatedDate (DateTime)
- Status (string) — enum'ın string karşılığı
- ApprovedAt (DateTime?)

ApproveVisitRequest.cs:
- AdminUserId (int)
- Action (string) — "Approve" veya "Reject"

Namespace: FieldVisits.API.Models.DTOs

**Prompt 2 (VisitService):**
Services/ klasörüne IVisitService interface'i ve VisitService implementasyonunu yaz.

Kullanılan tipler:
- AppDbContext (Data/AppDbContext.cs)
- Visit, User entity'leri (Models/Entities/)
- VisitStatus enum (Models/Enums/)
- DTO'lar (Models/DTOs/)

IVisitService metodları:
- Task<List<VisitResponse>> GetVisitsByUserAsync(int userId)
- Task<VisitResponse> CreateVisitAsync(CreateVisitRequest request)
- Task<VisitResponse> UpdateVisitAsync(int visitId, UpdateVisitRequest request)
- Task<List<VisitResponse>> GetAllVisitsAsync()
- Task<VisitResponse> ApproveOrRejectVisitAsync(int visitId, ApproveVisitRequest request)

VisitService iş kuralları — her birini mutlaka uygula:

CreateVisitAsync:
- VisitDate bugünden küçükse throw Exception("Geçmiş tarihli ziyaret oluşturulamaz.")
- CustomerName null veya boşsa throw Exception("Müşteri adı boş bırakılamaz.")
- Note 500 karakterden uzunsa throw Exception("Not alanı en fazla 500 karakter olabilir.")

UpdateVisitAsync:
- Ziyaret bulunamazsa throw Exception("Ziyaret bulunamadı.")
- Status == Approved ise throw Exception("Onaylanmış ziyaret düzenlenemez.")
- Aynı kurallar: geçmiş tarih, boş CustomerName, 500 karakter Note

ApproveOrRejectVisitAsync:
- Ziyaret bulunamazsa throw Exception("Ziyaret bulunamadı.")
- Action "Approve" ise Status = Approved, ApprovedAt = DateTime.UtcNow, ApprovedBy = request.AdminUserId
- Action "Reject" ise Status = Rejected
- Başka bir Action değeri gelirse throw Exception("Geçersiz işlem.")

Namespace: FieldVisits.API.Services

**Prompt 3 (Controller'lar):**
Controllers/ klasörüne VisitsController ve UsersController yaz.

VisitsController — route: api/visits:
- GET    /api/visits              → GetAllVisitsAsync()        [merkez için]
- GET    /api/visits/user/{userId}→ GetVisitsByUserAsync()     [saha kullanıcısı için]
- POST   /api/visits              → CreateVisitAsync()
- PUT    /api/visits/{id}         → UpdateVisitAsync()
- PATCH  /api/visits/{id}/status  → ApproveOrRejectVisitAsync()

UsersController — route: api/users:
- GET /api/users → tüm kullanıcıları listele (Id, Name, Email, Role)

IVisitService constructor injection ile gelsin.
Her endpoint try-catch ile sarılmasın — bu bir sonraki adımda Middleware yapacak.

**Prompt 4 (ExceptionMiddleware):**
Middleware/ExceptionMiddleware.cs dosyasını oluştur.

Tüm exception'ları yakala ve şu JSON formatında 400 döndür:
{ "error": "exception mesajı" }

Content-Type application/json olsun.
Program.cs'e app.UseMiddleware<ExceptionMiddleware>() satırını ekle,
app.UseAuthorization() satırından önce gelsin.

**AI Önerisi:**
VisitsController için IVisitService injection yaptı — doğru. UsersController için servis katmanı oluşturmak yerine AppDbContext'i doğrudan controller'a inject etti; liste yanıtı için promptta tanımlı olmayan `UserResponse` DTO'sunu ekledi. "İleride IUserService eklenebilir" notu düştü. Exception handling'i controller'lara değil middleware'e bıraktı; `Program.cs`'e `AddScoped<IVisitService, VisitService>()` kaydı eklendi.

**Kullandım mı?** Kısmen

**Gerekçe:**
- **Kabul ettiklerim:** DTO'lar, VisitService iş kuralları, VisitsController endpoint'leri ve ExceptionMiddleware prompttaki gereksinimlere uygun üretildi.
- **Değiştirdiklerim/Müdahaleler:** UsersController'da direkt DbContext kullanımını kabul ettim çünkü bu endpoint şu an sadece liste dönüyor ve test case kapsamında ayrı bir UserService yazmak zaman maliyeti yaratır. Ancak production kodda bu katman ayrımı bozulur — tutarlılık için IUserService eklenmeli.

**Sonuç:** Build başarılı, 0 error. Oluşturulan dosyalar: `Models/DTOs/*Request.cs`, `VisitResponse.cs`, `UserResponse.cs`, `Services/IVisitService.cs`, `Services/VisitService.cs`, `Controllers/VisitsController.cs`, `Controllers/UsersController.cs`, `Middleware/ExceptionMiddleware.cs`; `Program.cs` güncellendi.

---

### [LOG-03] | 20.06.2026 | Claude (chat) | Aşama 3 — SQL Sorguları

**Görev:** 4 adet PostgreSQL sorgusu yazmak (`sql/queries.sql`).

**Prompt:**
Field Visits uygulaması için PostgreSQL sorguları yaz:
1. En çok ziyaret gerçekleştiren ilk 5 kullanıcı
2. Son 30 gün içinde hiç ziyaret yapmayan kullanıcılar
3. Kullanıcı bazlı ziyaret raporu (toplam ziyaret, son ziyaret tarihi)
4. Merkez tarafından onaylanmamış ziyaretler

**AI Önerisi:**
Claude dört sorguyu tamamladı. Soru 2 için hem `NOT IN` + subquery hem de `LEFT JOIN` + `WHERE v."Id" IS NULL` alternatifini sundu; büyük veri setlerinde `LEFT JOIN` yaklaşımının daha performanslı olabileceğini belirtti.

**Kullandım mı?** Kısmen

**Gerekçe:**
- **Soru 1 — INNER JOIN:** Hiç ziyareti olmayan kullanıcıyı listeye almak anlamsız; `LEFT JOIN` olsaydı 0 ziyaretli kullanıcılar da gelirdi. `INNER JOIN` + `GROUP BY` + `ORDER BY COUNT DESC LIMIT 5` kabul edildi.
- **Soru 2 — NOT IN:** Okunabilirlik önceliğiyle `NOT IN` + subquery versiyonu seçildi. AI'ın önerdiği `LEFT JOIN` + `WHERE v."Id" IS NULL` alternatifi kullanılmadı; büyük tablolarda performans avantajı olabileceği bilinçli trade-off olarak not edildi.
- **Soru 3 — LEFT JOIN:** Tüm kullanıcıları (ziyareti olmayanlar dahil) raporlamak için `LEFT JOIN` + `GROUP BY` uygun.
- **Soru 4 — Status = 'Pending':** Pending olanlar "henüz karar verilmemiş" demek; Rejected olanlar da "onaylanmamış" sayılabilir. Test case'in ruhuna göre `Pending` daha doğru — değerlendirmeciye farklı yorumlanabilirlik için sorguya comment eklendi.

**Sonuç:** 4 sorgu `sql/queries.sql` dosyasına eklendi.

---

### [LOG-04] | 20–21.06.2026 | Cursor (Claude Opus 4.8) | Aşama 4 — React Native / Expo Frontend

**Görev:** Expo (React Native) mobil uygulamasını sıfırdan kurmak; API servis katmanı, navigasyon, ziyaret listeleme/ekleme/düzenleme/silme ekranları, onay-red akışı ve UI/UX tasarımını oluşturmak.

**Prompt 1 (API servis katmanı):**
FieldVisitsApp/services/api.js oluştur. BASE_URL http://localhost:5000/api. getVisitsByUser, getAllVisits, createVisit, updateVisit, approveOrRejectVisit, getUsers fonksiyonları; fetch ile, response.json() dönsün, hata durumunda throw new Error(data.error).

**Prompt 2 (Navigasyon + 3 ekran):**
screens/ klasörü oluştur, App.js'i güncelle. @react-navigation/native-stack ile VisitList (default), NewVisit, EditVisit. VisitListScreen: getVisitsByUser(1) + FlatList + "+" buton + useFocusEffect. NewVisitScreen: createVisit + Alert ile hata. EditVisitScreen: route.params.visit ile form + updateVisit.

**Prompt 3 (Form validation + date picker + stil):**
Form validation (boş customerName/visitDate), @react-native-community/datetimepicker, container/input/buton stil standardı.

**Prompt 4 (NativeWind ile UI revizyonu):**
NativeWind + Tailwind ile 3 ekranı yeniden tasarla, SafeAreaView/KeyboardAvoidingView, status badge, FAB.

**Prompt 5 (Bundling hatası):**
"TypeError: Cannot read properties of undefined (reading 'transformFile')" — Web Bundling failed.

**Prompt 6 (Katı UI/UX tasarımı, yalnızca RN bileşenleri):**
Ekstra kütüphane ekleme, sadece mevcut RN bileşenlerini kullan. VisitList kart tasarımı (44px daire baş harf, status'a göre renk, DD MMMM YYYY tarih, status badge, "+" header), NewVisit/EditVisit form + banner + karakter sayacı, "Approved ise kilitli" kuralı görselleştirme.

**Prompt 7 (Platform uyumlu tarih seçici):**
Web'de <input type="date">, native'de datetimepicker. minimumDate bugün; validation kuralları.

**Prompt 8 (Silme + onay/red aksiyonları):**
EditVisitScreen header'a Sil butonu (+ backend DELETE endpoint, DeleteVisitAsync: Approved silinemez / bulunamazsa hata). VisitListScreen'de onLongPress ile Onayla/Reddet menüsü.

**Prompt 9 (Temizlik):** Backend derle + kullanılmayan kodları kaldır.

**Prompt 10–11 (Web hata düzeltmeleri):** Güncelle ekranındaki Sil butonu ve status değiştirme web'de çalışmıyor.

**AI Önerisi:**
- React Navigation native-stack kurulumu, ortak `request` helper'ı, paylaşılan `DatePickerField` / `CalendarIcon` / `status` yapılandırması ile DRY yapı kuruldu.
- Bundling hatasının kök nedeni eksik `babel-preset-expo` paketiydi (NativeWind değil) — otonom tespit edilip kuruldu.
- `Alert.alert`'in butonlu diyaloglarının react-native-web'de çalışmadığı tespit edildi; web'de `window.confirm` / görünür kart butonları, native'de `Alert.alert` ile platform-uyumlu çözüm önerildi.
- Onaylanmış ziyaret düzenleme/silme kilidi hem UI hem backend katmanında uygulandı.

**Kullandım mı?** Evet (UI revizyonunda yön değiştirildi)

**Gerekçe:**
- **Kabul ettiklerim:** Servis katmanı, navigasyon, dört CRUD ekranı, form validation, platform-uyumlu tarih seçici ve silme/onay-red akışları gereksinimleri karşıladı.
- **Değiştirdiklerim/Müdahaleler:** Önce NativeWind (Tailwind) ile tasarım yapıldı; ancak "yalnızca yerleşik RN bileşenleri kullan" yönergesiyle ekranlar `StyleSheet`'e taşındı. Sonrasında kullanılmayan NativeWind/Reanimated yığını (config + 2 bileşen + paketler) temizlendi (bundle 851 → 473 modüle düştü). Web platformu özelinde `Alert.alert` davranışı için ek düzeltmeler yapıldı.

**Sonuç:** Expo web bundle başarılı (473 modül, 0 hata), lint temiz. Backend `DELETE /api/visits/{id}` eklendi ve derlendi. Uygulama listeleme, ekleme, düzenleme, silme ve onay/red işlemlerini hem web hem native'de yapıyor.

---

### [LOG-05] | 21.06.2026 | Cursor (Claude Opus 4.8, Composer 2.5) | Aşama 5 — Teslim Hazırlığı, Rol Tabanlı Akış ve Bölüm 5 Senaryoları

**Görev:** Teknik değerlendirme eksiklerini kapatmak; seed kullanıcılar, kullanıcı seçimi, 404 yönetimi, Bölüm 5/6 şablonları, duplicate ziyaret ve konum özellikleri, UX iyileştirmeleri, filtre/sıralama ve admin'e özel reddedilmiş ziyaret düzenleme kuralını uygulamak.

**Prompt 1 (PDF kriter kontrolü):**
Junior Software Developer Teknik Değerlendirme Çalışması PDF'indeki tüm kriterlere göre projeyi incele; eksik, farklı veya yanlış bir şey var mı?

**Prompt 2 (Bölüm 5 şablonu):**
README'yi proje bitince hazırlayacağım. Bölüm 5 için 3 senaryo halinde, kendi promptlarımı yazacağım boş alanlı bir dosya hazırla.

**Prompt 3 (Bölüm 6 şablonu + öneri):**
Bölüm 6 için ayrı dosya hazırla; kod incelemesini ben yapacağım ama geliştirdiğimiz projeye dayanarak öneri sun.

**Prompt 4 (Seed kullanıcılar):**
AppDbContext'e HasData ile seed kullanıcılar ekle ve migration işlemini yap. Case'de istenen formatı göz önünde bulundur.

**Prompt 5 (Kullanıcı seçimi vs giriş):**
Frontend'in userId=1 sabit gelmesini giriş ekranıyla çözebiliriz. Bu aşamada giriş/kayıt ekranı tasarlamak mantıklı mı?

**Prompt 6 (Plan uygulaması):**
Ekli planı uygula: UserContext + UserSelectScreen, rol bazlı liste (Admin → tüm ziyaretler + onay/red; Saha → kendi ziyaretleri), NotFoundException → 404, README ve teslim adımları.

**Prompt 7 (Lint düzeltmesi):**
ExceptionMiddleware.cs'de "Using directive is unnecessary" hatasını düzelt.

**Prompt 8 (Demo veri):**
Veritabanına kayıt girelim; uygulama dolu görünsün.

**Prompt 9 (Senaryo 1 — Duplicate ziyaret):**
Bölüm 5 Senaryo 1'i implemente et: aynı kullanıcı + müşteri + gün için duplicate ziyaret önle. Unique constraint migration + service validation.

**Prompt 10 (Senaryo 3 — Konum):**
Bölüm 5 Senaryo 3'ü implemente et: Backend'e Latitude/Longitude ekle; React Native'de "Konumumu Kullan" butonu olsun.

**Prompt 11 (Derleme / güncelle hataları):**
Derleme başarısız oluyor. / Güncelle butonu çalışmıyor, düzelt.

**Prompt 12 (UX iyileştirmeleri):**
Onaylanmış kayıtlarda onayla/reddet butonları görünmesin. Güncelleme başarısında görsel geri bildirim + listeye dön. Status'a göre filtreleme (tümü, bekliyor, onaylandı, reddedildi). Konum: GPS veya manuel adres, ikisi de opsiyonel. Silmede tarayıcı alert'i yerine uygulama içi onay ekranı.

**Prompt 13 (Filtre/sıralama UI):**
Filtre butonlarındaki tasarım hatalarını düzelt. Tarihe veya alfabetik gibi farklı parametrelere göre sıralama da olsun. Önce tek butonla panel, sonra filtreleme ve sıralama için ayrı butonlar istendi.

**Prompt 14 (Reddedilmiş ziyaret — yalnızca admin):**
Reddedilen ziyaretler güncelleme kısmından değiştirilebiliyor olsun; admin kısmı için tek böyle olsun (saha kullanıcısı için kilitli kalsın).

**AI Önerisi:**
- Tam login/auth yerine hafif **kullanıcı seçici** (UserSelectScreen + UserContext) önerildi; değerlendirme kapsamı için yeterli, JWT/şifre karmaşıklığından kaçınıldı.
- Duplicate engeli için hem DB unique index `(UserId, CustomerName, VisitDate)` hem `EnsureNoDuplicateVisitAsync` servis doğrulaması birlikte uygulandı.
- Konum için `expo-location` ile GPS; manuel adres için ayrı `Address` alanı ve migration eklendi (Senaryo 3'ün Latitude/Longitude şartının üzerine iş ihtiyacı genişletildi).
- Güncellemede geçmiş tarih: yalnızca **create**'te tam engel; tarih değişmeden mevcut geçmiş tarih korunabilir (`ValidateVisitData` + `originalVisitDate`).
- UX için `SuccessOverlay`, `ConfirmDialog`, `ListOptionsButton` (ayrı Filtrele | Sırala panelleri), `utils/sortVisits.js` ve web uyumlu `utils/alert.js` eklendi.
- Reddedilmiş ziyaret: UI'da saha için kilit; backend'de `RequestedByUserId` ile Admin doğrulaması; admin düzenleyince statü **Pending**'e alınır (yeniden onaya).

**Kullandım mı?** Evet (kısmen yön değiştirildi)

**Gerekçe:**
- **Kabul ettiklerim:** Seed kullanıcılar, kullanıcı seçimi, 404 ayrımı, duplicate ve konum özellikleri, filtre/sıralama ve admin'e özel reddedilmiş düzenleme kuralı proje gereksinimlerini güçlendirdi.
- **Değiştirdiklerim/Müdahaleler:** Giriş/kayıt ekranı yerine kullanıcı seçici tercih edildi. Konumda yalnızca koordinat değil opsiyonel manuel adres de eklendi. Filtre/sıralama önce tek panel, kullanıcı geri bildirimiyle iki ayrı butona ayrıldı. Bölüm 5/6 metinleri şablon olarak bırakıldı; prompt ve inceleme içerikleri kullanıcı tarafından doldurulacak. README iskeleti hazırlandı; nihai metin kullanıcıya bırakıldı.

**Sonuç:** Backend migration'ları: `SeedUsers`, `PreventDuplicateVisits`, `AddVisitLocation`, `AddVisitAddress`. Frontend: `UserSelectScreen`, `LocationField`, `ListOptionsButton`, `SuccessOverlay`, `ConfirmDialog`, `sortVisits.js`, `alert.js`. İş kuralları genişletildi (duplicate, konum, güncelleme tarihi, admin reddedilmiş düzenleme). Demo SQL verisi eklendi. Kısmen commit edildi (`seed users`, `user selection`, `README`); konum, filtre/sıralama ve reddedilmiş admin kuralı dahil son geliştirmeler henüz commit edilmedi.

---

### [LOG-06] | 22.06.2026 | Cursor (GPT-5.5) | Aşama 6 — Proje İyileştirme ve Büyütme Planı Uygulaması

**Görev:** Projeyi MVP/demo seviyesinden daha güvenli, test edilebilir ve büyütülebilir hale getirmek; önceden hazırlanan "Proje İyileştirme ve Büyütme Planı" maddelerini sırayla uygulamak.

**Prompt 1 (Proje analizi ve öneri):**
Bu projeyi iyileştirmek, geliştirmek veya büyütmek için ne yapmamı önerirsin? Projeyi analiz ederek tespit et.

**Prompt 2 (Plan hazırlama):**
Şimdi bana önerdiklerine göre bir plan listesi hazırla ve sırayla projeyi iyileştirip büyütelim.

**Prompt 3 (Plan uygulaması):**
Proje İyileştirme ve Büyütme Planı

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

**AI Önerisi:**
- Proje önce güvenlik açısından analiz edildi; kullanıcı seçimi/demo akışının gerçek uygulama için yeterli olmadığı, API tarafında gerçek auth/authorization olmadığı tespit edildi.
- İlk aşama olarak JWT tabanlı login, rol bazlı `[Authorize]` kullanımı, admin endpoint koruması ve saha kullanıcısının yalnızca kendi ziyaretlerine erişmesi önerildi.
- `CreateVisitRequest.UserId`, `ApproveVisitRequest.AdminUserId` ve `UpdateVisitRequest.RequestedByUserId` gibi istemciden gelen yetki belirleyici alanlara güvenilmemesi; kullanıcı kimliği ve rolünün token claimlerinden okunması önerildi.
- İş kurallarının korunması için backend test projesi ve `VisitService` unit testleri önerildi.
- Genel `Exception` kullanımının yerine `ValidationException`, `ForbiddenException`, `ConflictException`, `UnauthorizedException` gibi özel hata tipleri ve tutarlı JSON hata formatı önerildi.
- Listeleme büyüdüğünde performans sorunu yaşamamak için server-side pagination, search, status filter ve sort önerildi.
- `CustomerName` string alanından uzun vadede gerçek `Customer` modeline geçilmesi, ziyaret geçmişi/audit trail, red nedeni, check-in/check-out ve offline kayıt kuyruğu gibi ürünleşme özellikleri önerildi.

**Kullandım mı?** Evet

**Gerekçe:**
- **Kabul ettiklerim:** JWT auth, rol bazlı authorization, token claimlerinden kullanıcı/rol okuma, admin/saha erişim kuralları, özel exception tipleri, pagination/search/filter/sort, müşteri modeli, red nedeni, status history, check-in/check-out, offline kayıt kuyruğu ve backend test altyapısı uygulandı.
- **Değiştirdiklerim/Müdahaleler:** Önceki aşamada kullanılan demo kullanıcı seçimi gerçek login ekranına dönüştürüldü; ancak geliştirme kolaylığı için seed hesaplara hızlı giriş butonları bırakıldı. Seed kullanıcılar için ortak demo şifre `123456` belirlendi. Production için JWT key'in secret/env olarak yönetilmesi gerektiği not edildi.
- **Ortam müdahalesi:** `dotnet restore` sırasında bozuk/sandbox NuGet cache ve eksik DevExpress offline feed kaynaklı hatalar alındı. Restore işlemi proje içi izole `.nuget/packages` klasörüne yönlendirildi; `.nuget/` ve `.buildcheck/` kök `.gitignore` dosyasına eklendi.
- **Doğrulama müdahalesi:** Çalışan API süreci `bin/Debug/net9.0` dosyalarını kilitlediği için önce ayrı `.buildcheck/api` çıktısına build alındı; sonra eski API süreci kapatılıp migration üretildi ve API tekrar başlatıldı.

**Sonuç:** 
- Backend'e `AuthController`, `CustomersController`, JWT servisleri (`AuthService`, `TokenService`), claim helper'ları, özel exception tipleri, `Customer` ve `VisitStatusHistory` entity'leri eklendi.
- `VisitService` token tabanlı erişim kurallarıyla yeniden düzenlendi; duplicate kontrolü 409 Conflict dönecek hale getirildi; red nedeni, status history, check-in/check-out ve müşteri eşleştirme eklendi.
- API hata formatı `{ error, status, details }` yaklaşımına yaklaştırıldı; model validation hataları için özel response üretildi.
- Migration oluşturuldu: `SecurityAndGrowthFeatures`; PostgreSQL veritabanına başarıyla uygulandı.
- Frontend'de `UserSelectScreen` login ekranına dönüştürüldü; `UserContext` token/session saklayacak hale getirildi; `api.js` Authorization header, login, query string ve JSON olmayan hata cevaplarına dayanıklı hale getirildi.
- `VisitListScreen` server-side search/filter/sort/pagination, admin müşteri ekranı erişimi, red nedeni isteme ve offline kuyruk senkronizasyonu ile genişletildi.
- `CustomerListScreen` ve `offlineQueue.js` eklendi; `NewVisitScreen` offline kayıt kuyruğu ve check-in seçeneği kazandı; `EditVisitScreen` check-in/check-out ve red nedeni bilgisini gösterir hale geldi.
- Test projesi `FieldVisits.API.Tests` oluşturuldu; `VisitService` için 4 kritik test yazıldı. Son doğrulamada `dotnet test field-visits-app.sln --no-restore` başarılı oldu: 4/4 test geçti.

---

> **Not:** Bu log, proje boyunca her AI etkileşiminde güncellenecektir.
