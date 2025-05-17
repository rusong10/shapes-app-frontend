## Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- [Shapes App Backend](https://github.com/rusong10/shapes-app-backend) running locally

## Getting Started

Follow these steps to get your development environment set up:

**1. Clone the Repository**

```
git clone <https://github.com/rusong10/shapes-app-frontend.git>
cd SHAPES-APP-FRONTEND
```

**2. Install Dependencies**
```
npm install
```

**3. Set Up Environment Variables**
- Create a new file named .env in the root of the project and add the following environment variables:
```
NEXT_PUBLIC_API_BASE_URL=http://app.localtest.me:8000
NEXT_PUBLIC_WS_URL=ws://app.localtest.me:8000/ws/shapes/
```
- `NEXT_PUBLIC_API_BASE_URL`: The base URL for your Django backend's HTTP API.
- `NEXT_PUBLIC_WES_URL`: The URL for your Django Channels WebSocket endpoint.

**4. Ensure Backend API is Running**
Before starting the frontend, make sure your `shapes-app-backend` API is running.

### Running the Development Server
Once the dependencies are installed and environment variables are set up:
```
npx next dev -H app.localtest.me
```
Note: We use `app.localtest.me` instead of `localhost` so cookies (especially with `SameSite=Lax`) work correctly across subdomains, just like in production.

## Application Structure
- `/` - Public page displaying all shapes with real-time updates
- `/admin/login` - Admin login page
- `/admin` - Admin dashboard for managing shapes (requires authentication)
