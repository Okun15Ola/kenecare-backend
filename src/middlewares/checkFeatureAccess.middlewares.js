const featureService = require("../services/admin/featureFlag.services");

exports.checkFeatureAccess = (flagName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const isAllowed = await featureService.isFeatureEnabledForUser(
        flagName,
        userId,
      );
      if (!isAllowed) {
        return res.status(403).json({ message: "Feature not available" });
      }
      return next();
    } catch (error) {
      console.error("Feature flag middleware error:", error);
      return res.status(500).json({ message: "Server Error" });
    }
  };
};
