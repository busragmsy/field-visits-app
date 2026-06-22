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


## Kod İncelemem

Bu kod mevcut haliyle production'a alınamaz. Sadece CustomerName request üzerinden atanıyor. VisitDate requestten atanmıyor bu durumda tarih default olur ve geçmiş tarih kaydı oluşturulamayacağı kuralından dolayı hiç çalışmaz. Bununla birlikte alan atanmadığı için burada düzeltilmesi gereken temel yapı tüm alanların atanması olacaktır. Bu kodda doğru olan noktalar EF Core ekleme + SaveChangesAsync kullanımı ve async/await doğru. Ayrıca metot adı da CreateVisit yerine CreateVisitAsync olabilirdi. Burada tutarsızlık önlenirdi. 

1- UserId atanmıyor. Ziyaret hangi kullanıcıya ait belli olmaz; UserId = 0 ile FK ihlali / anlamsız kayıt oluşur.
2- CreatedDate ve Status = Pending set edilmiyor. İş akışında her yeni ziyaret "Beklemede" başlamalı; bu kod onu atlıyor.
3- Validation tamamen yok. Sadece geçmiş tarih değil; CustomerName boş/whitespace kontrolü ve Note ≤ 500 karakter sınırı da eksik. Projedeki ValidateVisitData bunları yapıyor.
4- Dönüş değeri yok (Task). Metot oluşturulan kaydı (özellikle DB'nin ürettiği Id) döndürmüyor. Controller'ın 201 Created dönebilmesi için Task<VisitResponse> gerekli.
5- Null güvenliği: request veya request.CustomerName null gelebilir, hiç kontrol edilmiyor.
6- UserId varlık doğrulaması: Verilen kullanıcı DB'de var mı kontrol edilmiyor.

Önerilen yapı: 

    '''
    public async Task<VisitResponse> CreateVisitAsync(CreateVisitRequest request)
    {
        ValidateVisitData(request.VisitDate, request.CustomerName, request.Note);

        var visit = new Visit
        {
            UserId = request.UserId,
            CustomerName = request.CustomerName,
            VisitDate = request.VisitDate,
            Note = request.Note,
            CreatedDate = DateTime.UtcNow,
            Status = VisitStatus.Pending
        };

        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        return MapToResponse(visit);
    }
    '''
