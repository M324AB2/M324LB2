# Verwenden eines offiziellen Node.js Basisimages
FROM node:18

# Arbeitsverzeichnis im Container festlegen
WORKDIR /app

# Kopieren der package.json und package-lock.json (falls vorhanden)
COPY package*.json ./

# Installieren von Abhängigkeiten
RUN npm install

# Kopieren des Quellcodes in das Arbeitsverzeichnis
COPY . .

# Linting durchführen
RUN npm run lint

# Tests durchführen
RUN npm run test

# Build durchführen
RUN npm run build

# Der Startbefehl, der beim Ausführen des Containers ausgeführt wird
CMD ["npm", "run" ,"start"]