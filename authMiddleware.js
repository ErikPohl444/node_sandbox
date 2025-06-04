const { verify } = require('./jwtUtils');

function requireAuth(request, response) {
  const auth = request.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    response.statusCode = 401;
    response.end('Missing or invalid Authorization header');
    return false;
  }
  const token = auth.slice(7);
  const decoded = verify(token);
  if (!decoded) {
    response.statusCode = 401;
    response.end('Invalid or expired token');
    return false;
  }
  // Optionally attach user info: request.user = decoded;
  return true;
}

module.exports = { requireAuth };