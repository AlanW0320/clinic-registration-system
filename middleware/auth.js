/**
 * middleware/auth.js — JWT verification middleware
 * Protects routes that require a logged-in user
 */

const jwt = require("jsonwebtoken");

/**
 * verifyToken — Checks Authorization: Bearer <token> header
 * Attaches decoded user payload to req.user
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

/**
 * verifyAdmin — Extends verifyToken; also checks role === 'admin'
 */
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  });
};

module.exports = { verifyToken, verifyAdmin };
