
// Check if user has specific role
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

      // Get role-specific profile
      const roleProfile = await req.user.getRoleProfile();
      if (!roleProfile) {
        return res.status(403).json({
          message: 'Role profile not found. Please contact support.'
        });
      }

      // Attach role profile to request
      req.roleProfile = roleProfile;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check admin permissions
export const checkAdminPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
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

// Check researcher lab access
export const checkLabAccess = (requiredLevel = 'basic') => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'researcher') {
        return res.status(403).json({ message: 'Researcher access required' });
      }

      const researcher = await req.user.getRoleProfile();
      const labAccess = researcher.labAccess.find(
        access => access.labId === req.params.labId
      );

      if (!labAccess) {
        return res.status(403).json({ message: 'No access to this lab' });
      }

      const accessLevels = ['basic', 'full', 'supervisor'];
      if (accessLevels.indexOf(labAccess.accessLevel) < accessLevels.indexOf(requiredLevel)) {
        return res.status(403).json({
          message: `Required access level: ${requiredLevel}`
        });
      }

      req.labAccess = labAccess;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check participant study enrollment
export const checkStudyEnrollment = () => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'participant') {
        return res.status(403).json({ message: 'Participant access required' });
      }

      const participant = await req.user.getRoleProfile();
      const study = participant.studies.find(
        study => study.studyId.toString() === req.params.studyId
      );

      if (!study) {
        return res.status(403).json({ message: 'Not enrolled in this study' });
      }

      if (study.status === 'withdrawn') {
        return res.status(403).json({ message: 'Withdrawn from this study' });
      }

      req.studyEnrollment = study;
      next();
    } catch (error) {
      next(error);
    }
  };
}; 