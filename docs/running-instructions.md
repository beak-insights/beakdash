# Running BeakDash in Development and Production

This guide provides detailed instructions for running the BeakDash application in both development and production environments.

## Development Environment

Running the application in development mode provides real-time feedback and hot-reloading for both frontend and backend changes.

### Prerequisites for Development

- Node.js 18+ (20+ recommended)
- npm or yarn

### Running in Development Mode

The simplest way to run the application in development mode is using the provided script:

```bash
./scripts/development-start.sh
```

Alternatively, you can run it directly with:

```bash
npm run dev
```

This command starts both the backend and frontend servers:

1. **Backend**: Express server running on port 5000
2. **Frontend**: A build of the client application that gets served by the Express server

### Development Environment Details

- **Backend (Express)**: Handles API requests and serves the frontend code
- **Hot Module Replacement**: Frontend changes are reflected immediately without full page reload
- **Automatic Restarts**: Backend restarts automatically when server files are changed

### Accessing the Development Application

- Frontend UI: [http://localhost:5000](http://localhost:5000)
- API endpoints: [http://localhost:5000/api/...](http://localhost:5000/api/...)

## Production Environment

For production deployment, the frontend is built into optimized static files and served by the Express backend.

### Prerequisites for Production

- Node.js 18+ (20+ recommended)
- npm or yarn

### Building for Production

To prepare the application for production, run the build script:

```bash
./scripts/production-build.sh
```

This script:
1. Builds the React frontend into optimized static files
2. Bundles the backend code with esbuild
3. Sets up production environment variables

### Running in Production Mode

After building, start the production server:

```bash
npm start
```

This command:
1. Starts the Express server in production mode
2. Serves the optimized static frontend files
3. Handles all API requests

### Production Environment Details

- **Single Server**: Both frontend and API requests are handled by a single Express server
- **Optimized Assets**: Frontend assets are minified and optimized for performance
- **Production Settings**: Node.js runs with production settings for better performance

### Accessing the Production Application

- Application: [http://localhost:5000](http://localhost:5000) (or your custom domain)

## Environment Variables

### Essential Environment Variables

Create a `.env` file in the project root with the following variables:

```
PORT=5000                       # Server port
OPENAI_API_KEY=your_api_key     # Required for AI features
```

### Additional Environment Variables

For more advanced configuration, you may want to set these optional variables:

```
NODE_ENV=development|production  # Application environment
VITE_API_URL=http://localhost:5000/api  # API URL for frontend
```

## Deployment to Hosting Platforms

### Deploying to Replit

1. Fork the project on Replit
2. Set up environment secrets:
   - OPENAI_API_KEY
3. The application starts automatically with the workflow

### Deploying to Other Platforms

For other hosting providers like Heroku, Vercel, or Railway:

1. Set up the repository on the platform
2. Configure environment variables
3. Use the build command: `npm run build`
4. Use the start command: `npm start`
5. Make sure the platform allows for both frontend and backend on the same server

## Troubleshooting

### Common Issues in Development

- **Port conflicts**: If port 5000 is already in use, set a different port in the `.env` file
- **Module not found errors**: Run `npm install` to ensure all dependencies are installed
- **Backend not restarting**: Try manually restarting with `npm run dev`

### Common Issues in Production

- **White screen after deployment**: Check the server logs for errors and ensure your build completed successfully
- **API requests failing**: Verify that your API URL configuration is correct
- **Environment variables not recognized**: Confirm that all required environment variables are set correctly

## Getting Help

If you're experiencing issues running the application, please:

1. Check the console logs for error messages
2. Refer to the troubleshooting section above
3. Check the GitHub issues for similar problems and solutions
4. Open a new issue if your problem isn't already documented