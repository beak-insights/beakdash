  // Get SQL Tables route (to retrieve available tables)
  app.get(`${apiPrefix}/connections/:id/tables`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Check if the connection exists
      const connection = await storage.getConnection(id);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Ensure it's a SQL connection
      if (connection.type !== 'sql') {
        return res.status(400).json({ message: "Connection must be of type 'sql'" });
      }
      
      // Get actual tables from the connection's database
      try {
        // Extract connection configuration
        const config = connection.config as Record<string, any>;
        if (!config) {
          return res.status(400).json({ message: "Connection configuration is missing" });
        }
        
        // Import pg directly like in db.ts
        const pg = await import('pg');
        
        // Build connection string from config
        let connectionString = '';
        if (config.connectionString) {
          connectionString = config.connectionString;
        } else {
          const connStr = buildPgConnectionString(config);
          if (!connStr) {
            return res.status(400).json({ 
              message: "Connection configuration is incomplete. Database and user/username are required."
            });
          }
          
          connectionString = connStr;
        }
        
        // Create temporary connection pool using pg.default.Pool constructor
        const tempPool = new pg.default.Pool({ connectionString });