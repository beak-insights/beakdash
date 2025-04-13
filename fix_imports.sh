#!/bin/bash

# Update import paths from @/hooks to @/lib/hooks
find ./app -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/hooks/use-|@/lib/hooks/use-|g'

echo "Import paths updated"