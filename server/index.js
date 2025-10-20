const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3001;
const CODE_EXPIRATION_MS = 5 * 60 * 1000;

const resetRequests = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendJson(res, statusCode, payload = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

async function requestHandler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/password-reset/request') {
      const { email } = await parseBody(req);

      if (!email || typeof email !== 'string') {
        sendJson(res, 400, { message: 'Debe proporcionar un correo válido.' });
        return;
      }

      const code = generateCode();
      resetRequests.set(email, {
        code,
        expiresAt: Date.now() + CODE_EXPIRATION_MS,
        verified: false,
      });

      sendJson(res, 200, {
        message: 'Código de recuperación generado correctamente.',
        code,
        expiresIn: CODE_EXPIRATION_MS / 1000,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/password-reset/verify') {
      const { email, code } = await parseBody(req);

      if (!email || typeof email !== 'string' || !code || typeof code !== 'string') {
        sendJson(res, 400, { message: 'Solicitud inválida.' });
        return;
      }

      const request = resetRequests.get(email);

      if (!request) {
        sendJson(res, 404, { message: 'No se encontró una solicitud para este correo.' });
        return;
      }

      if (request.expiresAt < Date.now()) {
        resetRequests.delete(email);
        sendJson(res, 410, { message: 'El código ha expirado. Solicita uno nuevo.' });
        return;
      }

      if (request.code !== code) {
        sendJson(res, 400, { message: 'El código ingresado es incorrecto.' });
        return;
      }

      request.verified = true;
      sendJson(res, 200, { message: 'Código verificado correctamente.' });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/password-reset/reset') {
      const { email, code } = await parseBody(req);

      if (!email || typeof email !== 'string' || !code || typeof code !== 'string') {
        sendJson(res, 400, { message: 'Solicitud inválida.' });
        return;
      }

      const request = resetRequests.get(email);

      if (!request) {
        sendJson(res, 404, { message: 'No se encontró una solicitud para este correo.' });
        return;
      }

      if (request.expiresAt < Date.now()) {
        resetRequests.delete(email);
        sendJson(res, 410, { message: 'El código ha expirado. Solicita uno nuevo.' });
        return;
      }

      if (request.code !== code) {
        sendJson(res, 400, { message: 'El código ingresado es incorrecto.' });
        return;
      }

      if (!request.verified) {
        sendJson(res, 400, { message: 'Debes verificar el código antes de restablecer la contraseña.' });
        return;
      }

      resetRequests.delete(email);
      sendJson(res, 200, { message: 'Solicitud de restablecimiento confirmada. Ahora puedes actualizar tu contraseña.' });
      return;
    }

    sendJson(res, 404, { message: 'Ruta no encontrada.' });
  } catch (error) {
    console.error('Unexpected error in password reset API', error);
    sendJson(res, 500, { message: 'Ocurrió un error inesperado.' });
  }
}

http.createServer(requestHandler).listen(PORT, () => {
  console.log(`Password reset API listening on port ${PORT}`);
});
