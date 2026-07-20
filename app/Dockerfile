# Minimal image for the demo app. Kept simple on purpose; the pipeline's Trivy
# and Checkov stages are what inspect it for issues.
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

EXPOSE 3000

# Drop root — even the vulnerable demo runs as a non-privileged user.
USER node

CMD ["node", "src/server.js"]
