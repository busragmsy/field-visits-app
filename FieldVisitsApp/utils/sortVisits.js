/**
 * Ziyaret listesini seçilen sıralama kriterine göre düzenler.
 */
export function sortVisits(visits, sortKey) {
  const list = [...visits];

  switch (sortKey) {
    case 'dateAsc':
      return list.sort((a, b) => a.visitDate.localeCompare(b.visitDate));
    case 'nameAsc':
      return list.sort((a, b) =>
        a.customerName.localeCompare(b.customerName, 'tr'),
      );
    case 'nameDesc':
      return list.sort((a, b) =>
        b.customerName.localeCompare(a.customerName, 'tr'),
      );
    case 'dateDesc':
    default:
      return list.sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  }
}
