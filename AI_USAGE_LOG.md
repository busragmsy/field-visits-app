# AI Usage Log — Field Visits App

Bu dosya, projedeki her yapay zeka kullanımının gerçek zamanlı kaydıdır.
README'deki AI Usage Report bu dosyadan derlenecektir.

---

## KAYITLAR

### [LOG-01] | 20 Haziran 2026 | Antigravity IDE | Aşama 1 — Scaffold ve Veritabanı Kurulumu

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

> **Not:** Bu log, proje boyunca her AI etkileşiminde güncellenecektir.
