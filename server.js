require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');
const connectDB = require('./src/config/database');
const { subdomainMiddleware } = require('./src/middleware/subdomain');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(fileUpload({
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Subdomain middleware
app.use(subdomainMiddleware);

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/universities', require('./src/routes/universities'));
app.use('/api/templates', require('./src/routes/templates'));
app.use('/api/certificates', require('./src/routes/certificates'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    university: req.university ? req.university.name : null,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
