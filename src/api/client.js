const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const buildHeaders = (withAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };

  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['x-token'] = token;
    }
  }

  return headers;
};

// Wrapper único sobre fetch. Respeta el contrato del backend { ok, mensaje, ...datos }:
// si ok es false, lanza un Error con el mensaje que mandó el backend.
const request = async (path, { method = 'GET', body, withAuth = false } = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(withAuth),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.mensaje || 'Ocurrió un error inesperado.');
  }

  return data;
};

export default request;
