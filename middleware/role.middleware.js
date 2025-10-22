export const checkRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Normalize roles to uppercase for case-insensitive comparison
      const requiredRoles = roles.map(r => String(r).toUpperCase());
      const userRole = String(req.user?.role || '').toUpperCase();

      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({
          message: `Access denied. Required roles: ${requiredRoles.join(', ')}`
        });
      }

      // Only attempt role profile retrieval if available on req.user
      if (typeof req.user?.getRoleProfile === 'function') {
        const roleProfile = await req.user.getRoleProfile();
        if (!roleProfile) {
          return res.status(403).json({
            message: 'Role profile not found. Please contact support.'
          });
        }
        req.roleProfile = roleProfile;
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const checkAdminPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      const userRole = String(req.user?.role || '').toUpperCase();
      if (!req.user || userRole !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      let hasAllPermissions = true;

      if (typeof req.user?.hasPermission === 'function') {
        const checks = await Promise.all(
          permissions.map(permission => req.user.hasPermission(permission))
        );
        hasAllPermissions = checks.every(Boolean);
      } else {
        const userPermissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
        hasAllPermissions = permissions.every(p => userPermissions.includes(p));
      }

      if (!hasAllPermissions) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};