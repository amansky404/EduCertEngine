const University = require('../models/University');

// Middleware to extract and attach university from subdomain
exports.subdomainMiddleware = async (req, res, next) => {
  try {
    const host = req.get('host');
    const baseDomain = process.env.BASE_DOMAIN || 'localhost:5000';
    
    // Extract subdomain
    let subdomain = null;
    
    if (host !== baseDomain) {
      const parts = host.split('.');
      const baseParts = baseDomain.split('.');
      
      // Check if there's a subdomain
      if (parts.length > baseParts.length) {
        subdomain = parts[0];
      }
    }
    
    // If subdomain exists, find the university
    if (subdomain && subdomain !== 'www') {
      const university = await University.findOne({ 
        subdomain, 
        isActive: true 
      });
      
      if (university) {
        req.university = university;
      }
    }
    
    next();
  } catch (error) {
    console.error('Subdomain middleware error:', error);
    next();
  }
};

// Require university middleware
exports.requireUniversity = (req, res, next) => {
  if (!req.university) {
    return res.status(404).json({
      success: false,
      message: 'University not found',
    });
  }
  next();
};
