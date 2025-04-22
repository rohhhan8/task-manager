const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized, no token' });
  }

  try {
    // Verify the token using the secret key from the .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Add the decoded user data to the request
    next();  // Allow the request to proceed to the next middleware or route
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = requireAuth;
