# Bölüm 5 - AI ile İletişim Becerisi

Bu bölümde kod yazılması beklenmemektedir. Amaç, verilen problemleri yapay zekaya
nasıl aktardığımı (prompt yazma becerimi) göstermektir. Aşağıdaki her senaryo için
yapay zekaya göndereceğim promptu ilgili alana yazıyorum.

---

## Senaryo 1 - Hata Araştırması

**Problem:**
Canlı ortamda, bazı kullanıcılar aynı müşteri için aynı gün içerisinde birden fazla
ziyaret oluşturabilmektedir. Bu istenmeyen durumun önüne geçilmesi gerekiyor.

**Yapay zekaya göndereceğim prompt:**

```
 Aynı UserId + CustomerName + VisitDate kombinasyonu için duplicate kaydı önleyecek validation ekle. Bunu hem veritabanında hem de VisitService katmanında uygula. Mevcut yapı için migration bozulmasın diye unique constraint olarak ayarla. EntityFramework Core 9 ile code-first yaklaşımıyla migration ekle. PostgreSql 16 uyumlu olsun.

```

---

## Senaryo 2 - Performans Problemi

**Problem:**
Ziyaretleri ekrana getiren endpoint, yaklaşık 100.000 kayıt sonrasında yavaş
çalışmaya başlamıştır. Performansın iyileştirilmesi gerekiyor.

**Yapay zekaya göndereceğim prompt:**

```
GET /api/visits endpoint'i 100.000+ kayıt sonrasında 
yavaş çalışıyor bunun için postgresqlde eksik indexleri tespit et ve migration ile ekle. EF Core sorgusuna da pagination ekle. gereksiz includeları kaldır sadece ihtiyaç duyulanlar kalsın. Tüm bu işlemlerden sonra tahmini iyileşme oranını ver.

```

---

## Senaryo 3 - Yeni Özellik Geliştirme

**Problem:**
İş birimi, her ziyaret için konum bilgisi tutulmasını talep etmiştir.
Kaydedilecek alanlar:
- Latitude
- Longitude

**Yapay zekaya göndereceğim prompt:**

```
Mevcut visit entity üzerine her ziyaret için konum bilgisi tutulacak. latitude ve longitude alanları ekle. konum bilgisini zorunlu tutma. Yapacağın işlemler için migration oluştur. create ve update dtolarına ekle. konum bilgisini gps'e bağla mevcut konum için otomatik gelsin ya da user manuel konum bilgisi kaydedebilsin. 

```
