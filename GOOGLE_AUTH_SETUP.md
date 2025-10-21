# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for the CMU APSCO application.

## Overview

The application now supports Google OAuth 2.0 authentication for user login. Users can sign in with their Google accounts, and the system will manage user sessions using JWT tokens.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Docker and Docker Compose installed
3. Node.js installed (for local React development)

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### 1.2 Enable Google+ API

1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity Services"
3. Click **Enable**

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** for user type
   - Fill in the app name: "CMU APSCO"
   - Add your email as support email
   - Add authorized domains if deploying to production
   - Save and continue
4. For Application type, select **Web application**
5. Add a name: "CMU APSCO Web Client"
6. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - Add your production domain when deploying
7. Add **Authorized redirect URIs**:
   - `http://localhost:3000` (for development)
   - Add your production domain when deploying
8. Click **Create**
9. **Copy the Client ID** - you'll need this later

## Step 2: Configure Backend (FastAPI)

### 2.1 Update Environment Variables

1. Copy the example environment file:
   ```bash
   cp fastapi/.env.example fastapi/.env
   ```

2. Edit `fastapi/.env` and add your credentials:
   ```env
   # Database configuration
   DB_HOST=postgis
   DB_PORT=5432
   DB_NAME=gis
   DB_USER=postgres
   DB_PASSWORD=postgres

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com

   # JWT Configuration
   JWT_SECRET_KEY=your-very-secure-random-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=10080

   # Google Earth Engine Configuration
   GEE_SERVICE_ACCOUNT=your-gee-service-account@your-project.iam.gserviceaccount.com
   GEE_KEY_FILE=your-gee-key-file.json
   ```

### 2.2 Generate a Secure JWT Secret

Generate a secure random secret key for JWT:

```bash
# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Or using OpenSSL
openssl rand -hex 32
```

Copy the output and use it as your `JWT_SECRET_KEY`.

### 2.3 Install Python Dependencies

```bash
cd fastapi
docker-compose exec fastapi pip install -r requirements.txt
```

Or rebuild the Docker container:
```bash
docker-compose down
docker-compose up -d --build fastapi
```

### 2.4 Run Database Migration

The users table needs to be created in the database:

```bash
docker exec cmu_apsco_postgis psql -U postgres -d gis -f /docker-entrypoint-initdb.d/03_create_users_table.sql
```

Or restart the PostGIS container to auto-run the migration:
```bash
docker-compose restart postgis
```

## Step 3: Configure Frontend (React)

### 3.1 Update Environment Variables

1. Copy the example environment file:
   ```bash
   cp react/.env.example react/.env
   ```

2. Edit `react/.env` and add your Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
   VITE_API_URL=http://localhost:8000
   ```

   **Important**: Use the same Client ID from Step 1.3

### 3.2 Update App.jsx to Include Login Route

Add the login route to your React application (this should already be done):

```jsx
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// In your Routes:
<Route path="/login" element={<LoginPage />} />
<Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
// ... wrap other routes with ProtectedRoute as needed
```

### 3.3 Install Dependencies and Run

```bash
cd react
npm install
docker-compose up -d react
```

## Step 4: Test the Authentication

1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

3. Test the login flow:
   - Navigate to http://localhost:3000/login
   - Click "Sign in with Google"
   - Complete the Google authentication
   - You should be redirected to the dashboard

4. Test the API endpoints:
   ```bash
   # Get current user info (requires authentication)
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:8000/api/auth/me
   ```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/google` | Authenticate with Google token | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| POST | `/api/auth/logout` | Logout (client-side token removal) | Yes |

### Request Examples

#### Login with Google
```bash
POST /api/auth/google
Content-Type: application/json

{
  "token": "google-id-token-from-frontend"
}

Response:
{
  "access_token": "jwt-token-here",
  "token_type": "bearer"
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer jwt-token-here

Response:
{
  "id": 1,
  "email": "user@example.com",
  "google_id": "1234567890",
  "name": "John Doe",
  "picture": "https://...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Frontend Usage

### Using the Auth Context

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Google Login Button

```jsx
import { GoogleLoginButton } from '../components/auth';

function LoginPage() {
  return (
    <GoogleLoginButton
      onSuccess={() => console.log('Login successful!')}
      onError={(error) => console.error('Login failed:', error)}
    />
  );
}
```

### Protected Routes

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Making Authenticated API Requests

### Using Fetch API

```javascript
const token = localStorage.getItem('access_token');

fetch('http://localhost:8000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Using Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
api.get('/api/auth/me').then(response => console.log(response.data));
```

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use HTTPS in production** - Update CORS and OAuth redirect URIs
3. **Rotate JWT secrets regularly** - Especially after security incidents
4. **Set appropriate token expiration** - Default is 7 days (10080 minutes)
5. **Validate user permissions** - Check user roles before granting access to sensitive data
6. **Update CORS origins** - In production, change from `*` to specific domains:

   ```python
   # In fastapi/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],  # Not "*"
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## Troubleshooting

### "Invalid Google token" Error

- Ensure the Google Client ID in backend `.env` matches the one used in frontend
- Check that the Google+ API is enabled in GCP
- Verify the OAuth consent screen is configured correctly

### "User not found" After Login

- Check if the database migration ran successfully
- Verify database connection settings in `.env`
- Check backend logs: `docker logs cmu_apsco_fastapi`

### CORS Errors

- Ensure the backend CORS middleware allows your frontend origin
- Check that credentials are set to `true` in CORS config
- Verify the API URL in frontend `.env` is correct

### Token Expired

- Tokens expire after the duration set in `ACCESS_TOKEN_EXPIRE_MINUTES`
- Users need to log in again after expiration
- Consider implementing refresh tokens for longer sessions

## Production Deployment

When deploying to production:

1. **Update OAuth credentials**:
   - Add production domain to authorized origins
   - Add production domain to redirect URIs

2. **Use environment variables**:
   - Never hardcode credentials
   - Use secure secret management (AWS Secrets Manager, etc.)

3. **Enable HTTPS**:
   - Use SSL/TLS certificates
   - Update all URLs to use `https://`

4. **Update CORS**:
   - Replace `*` with specific domain(s)
   - Enable only necessary methods

5. **Database security**:
   - Use strong database passwords
   - Enable SSL for database connections
   - Regular backups

6. **Monitor and log**:
   - Set up error tracking (Sentry, etc.)
   - Monitor authentication attempts
   - Log security events

## Support

For issues or questions:
- Check the FastAPI logs: `docker logs cmu_apsco_fastapi`
- Check the React logs: `docker logs cmu_apsco_react_dev`
- Review Google OAuth documentation: https://developers.google.com/identity
- Review FastAPI security docs: https://fastapi.tiangolo.com/tutorial/security/

## License

CMU APSCO © 2024 Chiang Mai University
