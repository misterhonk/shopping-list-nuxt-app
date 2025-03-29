#!/bin/bash

# Dieses Skript hilft beim Ersetzen von veralteten Typdefinitionen im Projekt

echo "Starte Ersetzung veralteter Typdefinitionen..."

# 1. Importe ersetzen
find . -type f -name "*.ts" -o -name "*.vue" | xargs grep -l "from '~/composables/types'" | while read file; do
  echo "Aktualisiere Importe in: $file"
  # Ersetze Import-Pfad
  sed -i '' 's|from '\''~/composables/types'\''|from '\''~/types/app-types'\''|g' "$file"
  
  # Ersetze Typnamen (ohne I-Präfix zu mit I-Präfix)
  sed -i '' 's/\bShoppingList\b/IShoppingList/g' "$file"
  sed -i '' 's/\bShoppingItem\b/IShoppingItem/g' "$file"
  sed -i '' 's/\bCategory\b/ICategory/g' "$file"
  sed -i '' 's/\bCategoryTemplate\b/ICategoryTemplate/g' "$file"
done

# 2. Typdeklarationen im Code ersetzen
find . -type f -name "*.ts" -o -name "*.vue" | grep -v "node_modules" | while read file; do
  echo "Überprüfe Typdeklarationen in: $file"
  
  # Nur Dateien bearbeiten, die keine I-präfigierten Typen verwenden
  if grep -q "ShoppingList\|ShoppingItem\|Category\|CategoryTemplate" "$file"; then
    echo "  Ersetze veraltete Typen in $file"
    sed -i '' 's/\bShoppingList\b/IShoppingList/g' "$file"
    sed -i '' 's/\bShoppingItem\b/IShoppingItem/g' "$file"
    sed -i '' 's/\bCategory\b/ICategory/g' "$file"
    sed -i '' 's/\bCategoryTemplate\b/ICategoryTemplate/g' "$file"
  fi
done

echo "Ersetzung abgeschlossen."
echo ""
echo "Hinweis: Dieses Skript ist eine Hilfe, aber keine vollständige Lösung."
echo "Bitte überprüfe deine Dateien manuell auf Typprobleme und konsultiere"
echo "die Migrationsdokumentation in scripts/type-migration.md."
