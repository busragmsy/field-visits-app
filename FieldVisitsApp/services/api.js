const BASE_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error('İşlem başarısız oldu.');
    }
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}

export function getVisitsByUser(userId) {
  return request(`/visits/user/${userId}`);
}

export function getAllVisits() {
  return request('/visits');
}

export function createVisit(data) {
  return request('/visits', {
    method: 'POST',
    body: JSON.stringify({
      userId: data.userId,
      customerName: data.customerName,
      visitDate: data.visitDate,
      note: data.note,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      address: data.address?.trim() || null,
    }),
  });
}

export function updateVisit(id, data) {
  return request(`/visits/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      customerName: data.customerName,
      visitDate: data.visitDate,
      note: data.note,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      address: data.address?.trim() || null,
      requestedByUserId: data.requestedByUserId ?? null,
    }),
  });
}

export function approveOrRejectVisit(id, data) {
  return request(`/visits/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      adminUserId: data.adminUserId,
      action: data.action,
    }),
  });
}

export function deleteVisit(id) {
  return request(`/visits/${id}`, {
    method: 'DELETE',
  });
}

export function getUsers() {
  return request('/users');
}
