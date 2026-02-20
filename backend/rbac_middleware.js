const logger = require('./logger');

/**
 * Middleware to check if user has a specific permission
 * @param {string} requiredPermission - The permission string to check for
 */
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user found in request" });
        }

        const permissions = req.user.permissions || [];
        const roles = req.user.roles || [];

        // Admin role bypasses all permission checks
        if (roles.includes('ADMIN')) {
            return next();
        }

        if (permissions.includes(requiredPermission)) {
            return next();
        }

        logger.warn(`Security Access Denied: User ${req.user.email} (ID: ${req.user.id}) attempted to access resource requiring ${requiredPermission} permission.`);
        
        return res.status(403).json({ 
            message: "Forbidden: You do not have the required permission",
            requiredPermission
        });
    };
};

/**
 * Middleware to check if user has a specific role
 * @param {string} requiredRole - The role string to check for
 */
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user found in request" });
        }

        const roles = req.user.roles || [];

        if (roles.includes(requiredRole)) {
            return next();
        }

        logger.warn(`Security Access Denied: User ${req.user.email} (ID: ${req.user.id}) attempted to access resource requiring ${requiredRole} role.`);

        return res.status(403).json({ 
            message: "Forbidden: You do not have the required role",
            requiredRole
        });
    };
};

module.exports = {
    checkPermission,
    checkRole
};
