
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
- Create a new file named .env.local in the root of the project
- Add the following environment variables to your .env.local file, adjusting the URLs if your backend is running on a different address or port:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/shapes/
```
- NEXT_PUBLIC_API_BASE_URL: The base URL for your Django backend's HTTP API.
- NEXT_PUBLIC_WES_URL: The URL for your Django Channels WebSocket endpoint.

**4. Ensure Backend API is Running**
Before starting the frontend, make sure your `shapes-app-backend` API is running, typically on `http://localhost:8000`

### Running the Development Server
Once the dependencies are installed and environment variables are set up:
```
npm run dev
```
This will start the Next.js development server, usually on `http://localhost:3000`. Open this URL in your browser to view the application.
- The main page (/) should display the public list of shapes with real-time updates.
- Navigate to /login to access the admin login page.
- After logging in as an admin, you should be able to navigate to /admin/shapes (or similar) to manage shapes.
