# Contributing to EduCertEngine

Thank you for your interest in contributing to EduCertEngine! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**

- Clear, descriptive title
- Detailed steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, MongoDB version)
- Error logs or stack traces

**Bug Report Template:**

```markdown
**Description:**
A clear description of the bug

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: [e.g., Ubuntu 20.04]
- Node.js: [e.g., v18.0.0]
- MongoDB: [e.g., v6.0]
- Browser: [if applicable]

**Logs:**
```
Paste relevant error logs here
```
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- Clear use case for the enhancement
- Detailed description of proposed functionality
- Mockups or examples (if applicable)
- Consideration of potential impacts

### Pull Requests

#### Before Starting

1. **Check existing issues** - Avoid duplicate work
2. **Open an issue first** - Discuss major changes before coding
3. **Fork the repository** - Create your own fork to work on

#### Development Process

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/EduCertEngine.git
   cd EduCertEngine
   ```

2. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

6. **Test your changes**
   ```bash
   npm run dev
   # Test manually and verify everything works
   ```

7. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

   **Commit Message Convention:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

8. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

#### Pull Request Guidelines

**Your PR should:**

- Have a clear, descriptive title
- Reference related issues (e.g., "Closes #123")
- Include a detailed description of changes
- Update relevant documentation
- Pass all existing tests (when implemented)
- Follow the project's code style
- Be focused on a single feature/fix

**PR Template:**

```markdown
## Description
Brief description of what this PR does

## Related Issues
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated (if applicable)
- [ ] All tests passing
- [ ] No breaking changes (or documented)
```

## Code Style Guidelines

### JavaScript/Node.js

- Use **2 spaces** for indentation
- Use **single quotes** for strings (except JSON)
- Use **semicolons**
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and models
- Use **UPPER_SNAKE_CASE** for constants
- Maximum line length: **100 characters**

**Example:**

```javascript
// Good
const userName = 'John Doe';
const MAX_UPLOAD_SIZE = 10485760;

function getUserById(id) {
  return User.findById(id);
}

// Bad
const user_name = "John Doe";
const maxUploadSize = 10485760;

function get_user_by_id(id) {
  return User.findById(id)
}
```

### File Organization

- Keep files focused and single-purpose
- Group related functionality together
- Use meaningful file and directory names
- Follow existing project structure

### Documentation

- Add JSDoc comments for functions
- Document complex logic
- Update README.md for new features
- Keep API.md synchronized

**Example:**

```javascript
/**
 * Generate QR code for certificate verification
 * @param {String} data - Data to encode in QR code
 * @param {String} certificateId - Certificate ID for filename
 * @returns {Promise<String>} - Path to generated QR code
 */
async function generateQRCode(data, certificateId) {
  // Implementation
}
```

## Project Structure

```
EduCertEngine/
├── src/
│   ├── config/           # Configuration files
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utility functions
├── public/               # Static files
├── client/               # Frontend (future)
├── tests/                # Test files (future)
├── docs/                 # Additional documentation
├── server.js             # Application entry point
└── package.json
```

## Development Tips

### Running in Development Mode

```bash
npm run dev
```

This starts the server with nodemon for auto-reloading.

### Database Reset

```bash
# Clear and reseed database
npm run seed
```

### Viewing Logs

```bash
# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Application logs (in dev mode)
# They appear in the terminal
```

### Testing API Endpoints

Use Postman collection:
```bash
# Import postman-collection.json into Postman
```

Or use curl/HTTPie as shown in QUICKSTART.md

## Areas for Contribution

### Current Priorities

1. **Frontend Development**
   - React admin panel
   - Template designer UI
   - Student portal interface

2. **Testing**
   - Unit tests for utilities
   - Integration tests for API
   - End-to-end tests

3. **Features**
   - Email notifications
   - Real-time preview
   - Advanced template editor
   - Analytics dashboard

4. **Documentation**
   - Video tutorials
   - More code examples
   - Architecture diagrams

5. **Internationalization**
   - Multi-language support
   - Localization

### Good First Issues

Look for issues labeled `good first issue` - these are ideal for newcomers.

## Questions?

- Open an issue for general questions
- Tag with `question` label
- Check existing discussions first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project README (for significant contributions)
- Release notes

## Getting Help

Need help with your contribution?

1. Check documentation (README.md, API.md, QUICKSTART.md)
2. Search existing issues
3. Open a new issue with `question` label
4. Be patient and respectful

## Review Process

1. **Initial Review** - Maintainers review within 3-5 days
2. **Feedback** - Address any requested changes
3. **Approval** - At least one maintainer approval required
4. **Merge** - Changes merged into main branch
5. **Release** - Included in next release

## Thank You!

Your contributions make EduCertEngine better for everyone. We appreciate your time and effort! 🎉
