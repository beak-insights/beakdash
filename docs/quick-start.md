# BeakDash Quick Start Guide

This quick start guide will help you get BeakDash up and running in minutes.

## Development (For Testing and Building)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/beakdash.git
   cd beakdash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to: [http://localhost:5000](http://localhost:5000)

## Production (For Deployment)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Configure for deployment**
   Before deploying to a hosting platform, ensure:
   - The `OPENAI_API_KEY` environment variable is set
   - Port configuration matches your hosting platform (default: 5000)

## Troubleshooting

- **Application not starting**: Ensure Node.js v18+ is installed
- **API errors**: Verify your OpenAI API key is valid and properly set
- **Port conflicts**: If port 5000 is already in use, set a different port in the `.env` file

## Additional Resources

- Detailed documentation: See [docs/running-instructions.md](./running-instructions.md)
- API endpoints: [http://localhost:5000/api/...](http://localhost:5000/api/...)
- GitHub repository: [https://github.com/yourusername/beakdash](https://github.com/yourusername/beakdash)