FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose Vite's default dev port
EXPOSE 5173

# Start Vite dev server exposing to all internal interfaces
CMD ["npm", "run", "dev", "--", "--host"]
