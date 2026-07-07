const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, iat, exp }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token is invalid or expired" });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.user?.role}' is not authorized.`
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
