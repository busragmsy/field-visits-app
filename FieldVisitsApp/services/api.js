import { getApiBaseUrl } from '../config/apiConfig';

const BASE_URL = getApiBaseUrl();
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );

  if (entries.length === 0) {
    return '';
  }

  const query = new URLSearchParams(entries).toString();
  return `?${query}`;
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    headers,
    ...options,
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error('İşlem başarısız oldu.');
    }
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error || 'İşlem başarısız oldu.');
  }

  return data;
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getVisitsByUser(userId, params = {}) {
  return request(`/visits/user/${userId}${buildQuery(params)}`);
}

export function getAllVisits(params = {}) {
  return request(`/visits${buildQuery(params)}`);
}

export function createVisit(data) {
  return request('/visits', {
    method: 'POST',
    body: JSON.stringify({
      customerName: data.customerName,
      visitDate: data.visitDate,
      note: data.note,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      address: data.address?.trim() || null,
      checkInNow: data.checkInNow ?? false,
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
      checkInNow: data.checkInNow ?? false,
      checkOutNow: data.checkOutNow ?? false,
    }),
  });
}

export function approveOrRejectVisit(id, data) {
  return request(`/visits/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: data.action,
      rejectReason: data.rejectReason ?? null,
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

export function getCustomers(search) {
  return request(`/customers${buildQuery({ search })}`);
}
