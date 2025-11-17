export const authMiddleware = (req, res, next) => {
  console.log('Auth check for:', req.path, 'Session:', !!req.session?.userId);

  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
