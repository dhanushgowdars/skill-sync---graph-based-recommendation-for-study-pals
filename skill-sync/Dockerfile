# ---------- Frontend Dockerfile (root/Dockerfile) ----------
# Use Node for React/Vite
FROM node:20-alpine

# Set workdir
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend project
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server so judges can see live app
# --host 0.0.0.0 allows access from outside container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
