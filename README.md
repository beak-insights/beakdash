# BeakDash - AI Dashboard Creator

BeakDash is a modular dashboard creation platform with customizable widgets, data visualization, and AI-assisted insights. It allows users to create custom dashboards, connect to various data sources, and visualize their data with powerful charts and widgets.

## Features

- Create and manage multiple dashboards
- Connect to various data sources (CSV, REST API, SQL)
- Create datasets from connections for data transformation
- Build customizable widgets with different chart types
- AI-powered insights and suggestions for your data
- Responsive dashboard layout with drag-and-drop functionality

## Technology Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js with Express
- **State Management**: React Query, Zustand
- **Charts**: Recharts
- **AI Integration**: OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm or yarn

### Quick Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/beakdash.git
   cd beakdash
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Environment setup:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser to [http://localhost:5000](http://localhost:5000)

## Running Instructions

We've created detailed guides for running BeakDash in both development and production environments:

- [Quick Start Guide](./docs/quick-start.md) - Get up and running in minutes
- [Detailed Running Instructions](./docs/running-instructions.md) - Comprehensive setup guide for development and production

### Development Environment in a Nutshell

```bash
# Start the application in development mode
npm run dev

# Or use our development script
./scripts/development-start.sh
```

The application will be available at:
- Frontend: [http://localhost:5000](http://localhost:5000)
- API endpoints: [http://localhost:5000/api/...](http://localhost:5000/api/...)

### Production Environment in a Nutshell

```bash
# Build for production
npm run build
# Or use our production build script
./scripts/production-build.sh

# Start the production server
npm start
```

The application will be available at:
- Production application: [http://localhost:5000](http://localhost:5000)

## Project Structure

```
beakdash/
├── client/               # Frontend code
│   ├── src/              # React application source code
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── store/        # State management
│   │   ├── App.tsx       # Main App component
│   │   └── main.tsx      # Entry point
│   └── index.html        # HTML template
├── server/               # Backend code
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # Data models and schemas
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## Using CSV Data

BeakDash allows you to create visualizations from CSV data:

1. **Create a CSV Connection**:
   - Go to the Connections page and click "New Connection"
   - Select "CSV" as the connection type
   - Upload a CSV file or paste CSV data
   - Configure CSV options (delimiter, headers, etc.)
   - Save the connection

2. **Create a Dataset**:
   - Go to the Datasets page and click "New Dataset"
   - Select your CSV connection
   - Optionally add transformations or filters
   - Save the dataset

3. **Create a Widget**:
   - Go to a dashboard and click "Add Widget"
   - Select your dataset
   - Choose a chart type (bar, line, pie, etc.)
   - Map your data columns to chart axes
   - Configure display options
   - Save the widget

## Deployment

The application can be deployed to any hosting platform that supports Node.js applications:

### Example Deployment on Replit

1. Fork the project on Replit
2. Set up environment variables:
   - OPENAI_API_KEY
3. Click "Run" to deploy the application

## Contributing

We welcome contributions to BeakDash! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.