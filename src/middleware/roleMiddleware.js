export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // 1️⃣ Check if user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login.",
      });
    }

    // 2️⃣ Check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};



