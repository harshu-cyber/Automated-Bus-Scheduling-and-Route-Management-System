const roleAuth = (roles = []) => {
    if (typeof roles === 'string') roles = [roles];

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ message: 'Forbidden — insufficient permissions' });
        }
        next();
    };
};

module.exports = { roleAuth };
