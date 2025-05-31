export const checkRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
      }

      const roleProfile = await req.user.getRoleProfile();
      if (!roleProfile) {
        return res.status(403).json({
          message: 'Role profile not found. Please contact support.'
        });
      }

      req.roleProfile = roleProfile;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkAdminPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const hasAllPermissions = await Promise.all(
        permissions.map(permission => req.user.hasPermission(permission))
      );

      if (hasAllPermissions.some(hasPermission => !hasPermission)) {
        return res.status(403).json({
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};