---
name: Proje İyileştirme
overview: Projeyi demo/MVP seviyesinden daha güvenli, test edilebilir ve büyütülebilir bir saha operasyon uygulamasına taşımak için aşamalı bir yol haritası. İlk aşama güvenlik ve test temeli, sonraki aşamalar API/UX kalitesi, raporlama ve ürün özellikleri üzerine kurulacak.
todos:
  - id: auth-security
    content: JWT login ve rol bazlı yetkilendirme planını uygulamaya hazırla
    status: completed
  - id: service-tests
    content: VisitService için backend test altyapısı ve kritik iş kuralı testlerini ekle
    status: completed
  - id: error-model
    content: API hata modelini özel exception ve tutarlı response formatıyla düzenle
    status: completed
  - id: list-performance
    content: Ziyaret listeleme için server-side filtreleme, arama ve pagination ekle
    status: completed
  - id: customer-model
    content: Customer modeli ve ziyaret geçmişi altyapısını tasarla
    status: completed
  - id: mobile-growth
    content: Offline kullanım, fotoğraf, harita ve check-in özelliklerini sonraki aşamalar için sırala
    status: completed
isProject: false
---

# Proje İyileştirme ve Büyütme Planı

## 1. Aşama: Güvenlik Temelini Sağlamlaştır

Önce gerçek uygulama için en kritik açıkları kapatacağız. Şu anda kullanıcı seçimi demo için uygun, ancak API tarafında gerçek kimlik doğrulama ve rol kontrolü yok.

Değişecek ana alanlar:
- [FieldVisits.API/Program.cs](FieldVisits.API/Program.cs)
- [FieldVisits.API/Controllers/VisitsController.cs](FieldVisits.API/Controllers/VisitsController.cs)
- [FieldVisits.API/Services/VisitService.cs](FieldVisits.API/Services/VisitService.cs)
- [FieldVisitsApp/screens/UserSelectScreen.js](FieldVisitsApp/screens/UserSelectScreen.js)
- [FieldVisitsApp/services/api.js](FieldVisitsApp/services/api.js)

Yapılacaklar:
- JWT tabanlı login akışı ekle.
- `UserSelectScreen` demo akışını gerçek login ekranına dönüştür veya geliştirme modu seçimi olarak izole et.
- Admin endpointlerini `[Authorize(Roles = "Admin")]` ile koru.
- Saha kullanıcısının yalnızca kendi ziyaretlerini görmesini API tarafında zorunlu kıl.
- `ApproveVisitRequest.AdminUserId` gibi istemciden gelen yetki belirleyici alanlara güvenmeyi bırak.
- `CreateVisitRequest.UserId` yerine kullanıcı bilgisini token claimlerinden al.

Öncelik: Çok yüksek.

## 2. Aşama: İş Kuralları ve Test Altyapısı

Güvenlikten sonra en önemli yatırım testler olacak. Özellikle [FieldVisits.API/Services/VisitService.cs](FieldVisits.API/Services/VisitService.cs) içindeki iş kuralları projenin omurgası.

Yapılacaklar:
- Backend için test projesi ekle.
- `VisitService` unit testleri yaz.
- Duplicate ziyaret, geçmiş tarih, not/adres uzunluğu, lokasyon aralığı ve onaylı kayıt kilidi senaryolarını test et.
- Controller seviyesinde temel integration testleri ekle.
- Frontend için en azından saf utility fonksiyonlarını test et: [FieldVisitsApp/utils/sortVisits.js](FieldVisitsApp/utils/sortVisits.js), tarih/status yardımcıları.

Öncelik: Çok yüksek.

## 3. Aşama: API Hata Modeli ve Veri Doğrulama

Şu anda birçok iş kuralı genel `Exception` ile yönetiliyor. Bunu daha okunabilir, sürdürülebilir ve frontend için daha tahmin edilebilir hale getireceğiz.

Değişecek ana alanlar:
- [FieldVisits.API/Middleware/ExceptionMiddleware.cs](FieldVisits.API/Middleware/ExceptionMiddleware.cs)
- [FieldVisits.API/Models/DTOs](FieldVisits.API/Models/DTOs)
- [FieldVisitsApp/services/api.js](FieldVisitsApp/services/api.js)

Yapılacaklar:
- `ValidationException`, `ForbiddenException`, `ConflictException` gibi özel exception tipleri ekle.
- Duplicate ziyaret için 409 Conflict dön.
- Yetkisiz/yasak işlemler için 401/403 ayrımı yap.
- Frontend `request` fonksiyonunu JSON olmayan hata cevaplarına karşı dayanıklı hale getir.
- API cevap formatını `{ error, details }` veya `ProblemDetails` standardına yaklaştır.

Öncelik: Yüksek.

## 4. Aşama: Listeleme, Arama ve Performans

Veri büyüdüğünde tüm kayıtları tek seferde çekmek sorun çıkarır. Admin ekranını gerçek operasyon paneline yaklaştıracağız.

Değişecek ana alanlar:
- [FieldVisits.API/Controllers/VisitsController.cs](FieldVisits.API/Controllers/VisitsController.cs)
- [FieldVisits.API/Services/VisitService.cs](FieldVisits.API/Services/VisitService.cs)
- [FieldVisitsApp/screens/VisitListScreen.js](FieldVisitsApp/screens/VisitListScreen.js)

Yapılacaklar:
- Server-side pagination ekle.
- Tarih aralığı, durum, kullanıcı ve müşteri adına göre filtreleme ekle.
- Admin listesinde arama kutusu ve filtre paneli ekle.
- Sıralama bilgisini mümkün olduğunca API’ye taşı.
- Boş, yükleniyor ve hata durumlarını kullanıcıya daha görünür hale getir.

Öncelik: Orta-yüksek.

## 5. Aşama: Müşteri Modeli ve Ziyaret Geçmişi

Projeyi büyütmek için `CustomerName` string alanından gerçek müşteri modeline geçmek önemli. Bu sayede ziyaret geçmişi ve raporlama güçlenir.

Yeni/Değişecek alanlar:
- `Customer` entity ve migration
- `CustomersController`
- Visit ile Customer ilişkisi
- Mobilde müşteri seçme/arama ekranı

Yapılacaklar:
- `Customers` tablosu oluştur.
- `Visit.CustomerName` yerine uzun vadede `CustomerId` kullan.
- Müşteri detay ekranında tüm ziyaret geçmişini göster.
- Müşteri adresi, telefon, yetkili kişi gibi alanlar ekle.

Öncelik: Orta.

## 6. Aşama: Onay Sürecini Zenginleştir

Mevcut onay/red akışı iyi bir başlangıç. Operasyonel ihtiyaçlar için daha açıklayıcı hale getirilebilir.

Yapılacaklar:
- Red işlemi için `RejectReason` ekle.
- Ziyaret durum geçmişi/audit trail tut.
- Kim, ne zaman, hangi işlemi yaptı bilgisini sakla.
- Reddedilen ziyaretin tekrar düzenlenip onaya gönderilme akışını daha net modelle.
- Admin ekranında bekleyen ziyaret sayısı ve hızlı işlem alanları ekle.

Öncelik: Orta.

## 7. Aşama: Mobil Kullanım Kalitesi

Saha uygulamasının değerini artıracak taraf burası. Konum, offline kullanım ve görsel ekler sahada çok işe yarar.

Yapılacaklar:
- Offline kayıt kuyruğu ekle.
- Bağlantı gelince senkronizasyon yap.
- Harita görünümü ekle.
- Ziyarete fotoğraf ekleme özelliği ekle.
- Check-in/check-out saatleri ekle.
- Konum izni reddedildiğinde daha iyi açıklama ekranı göster.

Öncelik: Orta.

## 8. Aşama: Raporlama ve Yönetim Paneli

Admin için değer üretecek görünür çıktıların ekleneceği aşama.

Yapılacaklar:
- Kullanıcı bazlı ziyaret sayıları.
- Bekleyen/onaylanan/reddedilen ziyaret dağılımı.
- Son 30 gün aktivite grafiği.
- CSV/Excel export.
- Basit web admin paneli veya mobil içi dashboard.

Öncelik: Orta-düşük.

## 9. Aşama: DevOps ve Ürünleşme

Proje büyüdükçe çalıştırma, dağıtım ve kalite kontrol süreçleri standart hale getirilmeli.

Yapılacaklar:
- Backend ve frontend için lint/test scriptleri standardize et.
- GitHub Actions veya benzeri CI pipeline ekle.
- Docker Compose içine API servisini de dahil et.
- Production config ve secret yönetimini düzenle.
- README’ye geliştirme, test ve deployment adımlarını güncelle.

Öncelik: Orta-düşük.

## Önerilen Uygulama Sırası

İlk sprintte sadece 1-3. aşamaları ele almak en sağlıklı yol olur:

1. JWT auth ve rol bazlı yetkilendirme.
2. Admin/saha erişim kurallarını API tarafında zorunlu hale getirme.
3. Backend test projesi ve kritik `VisitService` testleri.
4. API hata modelini düzeltme.
5. Frontend API istemcisini yeni hata ve auth akışına uyarlama.

Bu temel oturduktan sonra 4. aşamaya, yani filtreleme/pagination ve daha iyi liste deneyimine geçebiliriz.