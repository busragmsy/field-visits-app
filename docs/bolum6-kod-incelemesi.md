# Bölüm 6 - Yapay Zeka Kod İncelemesi

Aşağıdaki kodun bir yapay zeka aracı tarafından üretildiğini varsayıyoruz.
Yaptığımız projeyi, iş kurallarını ve talepleri göz önünde bulundurarak kod
incelemesi yapıyorum.

## İncelenecek Kod

```csharp
public async Task CreateVisit(CreateVisitRequest request)
{
    var visit = new Visit();
    visit.CustomerName = request.CustomerName;
    _db.Visits.Add(visit);
    await _db.SaveChangesAsync();
}
```

---

## Kod İncelemem

<!-- Buraya kendi incelemeni yaz -->



---

## Öneri / İpuçları (projemize dayalı referans)

> Not: Bu bölüm, kendi incelemeni yazarken yön bulman için projedeki gerçek
> uygulamayla (`FieldVisits.API/Services/VisitService.cs`) karşılaştırmalı
> hazırlanmış bir referanstır. Aşağıdaki başlıklar, bizim projede zaten doğru
> yaptığımız ama bu AI kodunda eksik/yanlış olan noktaları gösterir.

### 1. İş kuralları (validation) tamamen eksik
Projedeki gereksinimler hiç uygulanmamış. Bizim `VisitService.CreateVisitAsync`
içinde `ValidateVisitData` ile yapılan kontroller burada yok:
- Geçmiş tarihli ziyaret engeli (`VisitDate < bugün`) yok.
- `CustomerName` boş/whitespace kontrolü yok.
- `Note` için 500 karakter sınırı kontrolü yok.

### 2. Alanların büyük kısmı atanmıyor (eksik/bozuk kayıt)
`request`'ten yalnızca `CustomerName` aktarılıyor. Diğer kritik alanlar boş kalıyor:
- `UserId` atanmıyor -> ziyaret hangi kullanıcıya ait belli değil ve FK ihlali
  (ya da userId=0) oluşur.
- `VisitDate` atanmıyor -> varsayılan/yanlış tarih.
- `Note` atanmıyor.
- `CreatedDate` ve `Status = Pending` set edilmiyor (bizim serviste set ediliyor).

### 3. Kullanıcı (UserId) doğrulaması yok
Verilen `UserId` veritabanında var mı kontrol edilmiyor. Olmayan bir kullanıcı için
ziyaret oluşturma denemesi anlamsız FK hatasına yol açar; anlamlı bir mesaj dönmeli.

### 4. Hata yönetimi ve anlamlı mesaj yok
PDF "hatalı isteklerde anlamlı hata mesajları dönülmelidir" diyor. Bu kod hiçbir
doğrulama yapmadığı için anlamlı hata üretmez; bizim projede bu, exception'lar +
`ExceptionMiddleware` ile `{ "error": "..." }` formatında çözülüyor.

### 5. Dönüş değeri yok (`Task`)
Metot oluşturulan ziyareti geri döndürmüyor. Bizim `CreateVisitAsync`
`Task<VisitResponse>` döndürüp oluşturulan kaydı (Id dahil) çağırana veriyor.
Controller tarafında `201 Created` dönebilmek için bu gereklidir.

### 6. Entity'nin doğrudan kullanılması / katman ihlali
`request` -> `Visit` eşlemesi var ama dönüşte de entity'nin sızmaması için
DTO (`VisitResponse`) kullanımı tercih edilmeli (bizim projede `MapToResponse`).

### 7. Null/girdi güvenliği
`request` veya `request.CustomerName` null gelebilir; hiç kontrol edilmiyor.

### Özet
Bu kod yalnızca "ekle ve kaydet" yapıyor; projenin iş kurallarının, alan
atamalarının, doğrulamaların, hata yönetiminin ve katman ayrımının tamamını
atlıyor. Doğru hali, projedeki `VisitService.CreateVisitAsync` metodudur.
