import { db } from "@/lib/db";
import { spaces } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

/**
 * This function adds the is_default column to the spaces table if it doesn't exist
 */
export async function migrateSpacesTable() {
  try {
    console.log("Checking if spaces table needs migration...");
    
    // Check if is_default column exists
    const columnsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'spaces' AND column_name = 'is_default'
    `);
    
    const columns = columnsResult as unknown as { rows: any[] };
    
    if (!columns.rows || columns.rows.length === 0) {
      console.log("Adding is_default column to spaces table...");
      
      try {
        // Add the is_default column
        await db.execute(sql`
          ALTER TABLE spaces 
          ADD COLUMN is_default BOOLEAN DEFAULT FALSE
        `);
        
        console.log("Migration completed successfully");
      } catch (error) {
        // Check if the error is because the column already exists
        if (error instanceof Error && 
            error.message.includes("column \"is_default\" of relation \"spaces\" already exists")) {
          console.log("is_default column already exists, skipping this step");
        } else {
          // If it's a different error, rethrow it
          throw error;
        }
      }
    } else {
      console.log("is_default column already exists, no migration needed");
    }
    
    // Set the first space as default if no default space exists
    const defaultSpaces = await db.query.spaces.findMany({
      where: (spaces, { eq }) => eq(spaces.isDefault, true)
    });
    
    if (defaultSpaces.length === 0) {
      console.log("No default space found, setting the first space as default...");
      
      const allSpaces = await db.query.spaces.findMany({
        orderBy: (spaces, { asc }) => [asc(spaces.id)]
      });
      
      if (allSpaces.length > 0) {
        await db.update(spaces)
          .set({ isDefault: true })
          .where(sql`id = ${allSpaces[0].id}`);
        
        console.log(`Set space '${allSpaces[0].name}' (ID: ${allSpaces[0].id}) as default`);
      } else {
        console.log("No spaces found, creating a default space...");
        
        await db.insert(spaces).values({
          name: "Default Space",
          description: "This is your default space",
          slug: "default-space",
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log("Created default space");
      }
    }
    
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}