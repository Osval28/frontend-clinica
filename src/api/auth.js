import request from './client';

// POST /api/auth/login espera { correo, password } y responde
// { ok, mensaje, administrador, token } según authController.js del backend.
export const login = (correo, password) => {
  return request('/auth/login', {
    method: 'POST',
    body: { correo, password },
  });
};
