# BeakDash SDK

Official SDK for BeakDash - AI-powered dashboard platform.

## Installation

```bash
npm install @beakdash/sdk
# or
yarn add @beakdash/sdk
# or
pnpm add @beakdash/sdk
```

## Usage

```typescript
import { BeakDashSDK } from '@beakdash/sdk';

// Initialize the SDK
const sdk = new BeakDashSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.beakdash.com/v1' // optional
});

// Get all dashboards
const dashboards = await sdk.getDashboards();

// Get a specific dashboard
const dashboard = await sdk.getDashboard('dashboard-id');

// Create a new dashboard
const newDashboard = await sdk.createDashboard({
  name: 'My Dashboard',
  description: 'A new dashboard',
  widgets: []
});

// Update a dashboard
const updatedDashboard = await sdk.updateDashboard('dashboard-id', {
  name: 'Updated Name'
});

// Delete a dashboard
await sdk.deleteDashboard('dashboard-id');

// Get widgets for a dashboard
const widgets = await sdk.getWidgets('dashboard-id');

// Create a new widget
const newWidget = await sdk.createWidget('dashboard-id', {
  type: 'chart',
  title: 'My Chart',
  config: {
    // widget configuration
  }
});

// Update a widget
const updatedWidget = await sdk.updateWidget('dashboard-id', 'widget-id', {
  title: 'Updated Title'
});

// Delete a widget
await sdk.deleteWidget('dashboard-id', 'widget-id');

// Embed a dashboard
const embedConfig = {
  dashboardId: 'dashboard-id',
  theme: 'light',
  height: '600px',
  width: '100%',
  showHeader: true,
  showControls: true,
  refreshInterval: 300, // 5 minutes
  customStyles: {
    '--primary-color': '#007bff',
    '--background-color': '#ffffff'
  }
};

// Create an embed token
const { token } = await sdk.createEmbedToken(embedConfig);

// Get the embed URL
const embedUrl = sdk.getEmbedUrl(token, embedConfig);

// Get the embed HTML
const embedHtml = sdk.getEmbedHtml(token, embedConfig);
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 7+

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/beakdash.git
cd beakdash
```

2. Install dependencies:
```bash
pnpm install
```

3. Build packages:
```bash
pnpm build:packages
```

### Project Structure

```
beakdash/
├── packages/
│   ├── shared/     # Shared types and utilities
│   └── sdk/        # BeakDash SDK
└── package.json    # Root package.json with workspaces
```

### Development Workflow

1. Make changes to the SDK or shared package
2. Build the packages:
```bash
pnpm build:packages
```
3. Test your changes
4. Update version numbers in package.json files
5. Create a release

### Releasing

1. Update version numbers:
```bash
# In packages/shared/package.json
# In packages/sdk/package.json
```

2. Build packages:
```bash
pnpm build:packages
```

3. Publish to npm:
```bash
cd packages/shared && pnpm publish
cd ../sdk && pnpm publish
```

## API Reference

### BeakDashSDK

The main SDK class that provides methods to interact with the BeakDash API.

#### Constructor

```typescript
new BeakDashSDK(config: BeakDashConfig)
```

#### Configuration

```typescript
interface BeakDashConfig {
  apiKey: string;
  baseUrl?: string;
}
```

### Methods

#### Dashboards

- `getDashboards(): Promise<Dashboard[]>`
- `getDashboard(id: string): Promise<Dashboard>`
- `createDashboard(data: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard>`
- `updateDashboard(id: string, data: Partial<Dashboard>): Promise<Dashboard>`
- `deleteDashboard(id: string): Promise<void>`

#### Widgets

- `getWidgets(dashboardId: string): Promise<Widget[]>`
- `createWidget(dashboardId: string, data: Omit<Widget, 'id'>): Promise<Widget>`
- `updateWidget(dashboardId: string, widgetId: string, data: Partial<Widget>): Promise<Widget>`
- `deleteWidget(dashboardId: string, widgetId: string): Promise<void>`

#### Embed

- `createEmbedToken(config: EmbedConfig): Promise<EmbedToken>`
- `getEmbedUrl(token: string, config: EmbedConfig): string`
- `getEmbedHtml(token: string, config: EmbedConfig): string`

### Types

#### Dashboard

```typescript
interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
}
```

#### Widget

```typescript
interface Widget {
  id: string;
  type: string;
  title: string;
  config: Record<string, any>;
  data?: any;
}
```

#### EmbedConfig

```typescript
interface EmbedConfig {
  dashboardId: string;
  theme?: 'light' | 'dark' | 'system';
  height?: string | number;
  width?: string | number;
  showHeader?: boolean;
  showControls?: boolean;
  refreshInterval?: number;
  customStyles?: Record<string, string>;
}
```

#### EmbedToken

```typescript
interface EmbedToken {
  token: string;
  expiresAt: string;
}
```

## Error Handling

The SDK provides specific error classes for different types of errors:

```typescript
try {
  await sdk.getDashboard('non-existent-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Dashboard not found');
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed');
  } else if (error instanceof ValidationError) {
    console.error('Invalid input');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof ServerError) {
    console.error('Server error');
  } else {
    console.error('Unknown error');
  }
}
```

## License

MIT 