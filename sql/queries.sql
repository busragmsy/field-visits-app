-- ============================================
-- SORU 1
-- En çok ziyaret gerçekleştiren ilk 5 kullanıcı
-- ============================================
SELECT
    u."Id",
    u."Name",
    u."Email",
    COUNT(v."Id") AS "TotalVisits"
FROM "Users" u
INNER JOIN "Visits" v ON v."UserId" = u."Id"
GROUP BY u."Id", u."Name", u."Email"
ORDER BY "TotalVisits" DESC
LIMIT 5;


-- ============================================
-- SORU 2
-- Son 30 gün içinde hiç ziyaret yapmayan kullanıcılar
-- ============================================
SELECT
    u."Id",
    u."Name",
    u."Email"
FROM "Users" u
WHERE u."Id" NOT IN (
    SELECT DISTINCT v."UserId"
    FROM "Visits" v
    WHERE v."VisitDate" >= CURRENT_DATE - INTERVAL '30 days'
);


-- ============================================
-- SORU 3
-- Kullanıcı bazlı ziyaret raporu
-- ============================================
SELECT
    u."Name"        AS "Kullanıcı Adı",
    COUNT(v."Id")   AS "Toplam Ziyaret Sayısı",
    MAX(v."VisitDate") AS "Son Ziyaret Tarihi"
FROM "Users" u
LEFT JOIN "Visits" v ON v."UserId" = u."Id"
GROUP BY u."Id", u."Name"
ORDER BY "Toplam Ziyaret Sayısı" DESC;


-- ============================================
-- SORU 4
-- Merkez tarafından onaylanmamış ziyaretler
-- Not: "Onaylanmamış" yalnızca Pending (henüz karar verilmemiş) olarak
-- yorumlandı. Rejected kayıtlar da anlam olarak onaylanmamış sayılabilir;
-- test case kapsamında Pending filtresi tercih edildi.
-- ============================================
SELECT
    v."Id",
    u."Name"            AS "Kullanıcı Adı",
    v."CustomerName"    AS "Müşteri Adı",
    v."VisitDate"       AS "Ziyaret Tarihi",
    v."Note"            AS "Not",
    v."Status"          AS "Durum",
    v."CreatedDate"     AS "Oluşturulma Tarihi"
FROM "Visits" v
INNER JOIN "Users" u ON u."Id" = v."UserId"
WHERE v."Status" = 'Pending'
ORDER BY v."CreatedDate" DESC;