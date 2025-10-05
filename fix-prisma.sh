
#!/bin/bash

# List of files that need to be fixed
files=(
  "src/app/api/test/route.js"
  "src/app/api/v1/checklistitems/[id]/route.js"
  "src/app/api/v1/checklistitems/route.js"
  "src/app/api/v1/setting/category/[category]/route.js"
  "src/app/api/v1/varients/[id]/route.js"
  "src/app/api/v1/varients/route.js"
  "src/app/api/v1/brands/[id]/route.js"
  "src/app/api/v1/brands/route.js"
  "src/app/api/v1/states/stats/route.js"
  "src/app/api/v1/states/route.js"
  "src/app/api/v1/models/[id]/route.js"
  "src/app/api/v1/models/route.js"
  "src/app/api/v1/checklistcategories/stats/route.js"
  "src/app/api/v1/checklistcategories/route.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file"
    # Remove PrismaClient import
    sed -i '/import.*PrismaClient.*from/d' "$file"
    # Remove const prisma = new PrismaClient()
    sed -i '/const prisma = new PrismaClient()/d' "$file"
    # Add the correct import at the top
    sed -i '1i import { prisma } from '''../../../../../lib/prisma''';' "$file"
  fi
done

echo "Done fixing Prisma imports!"
