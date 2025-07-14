# Établissement Application

This is a Next.js application for managing establishments and investigations.

## Docker Installation Instructions

### Prerequisites
- Docker installed on your system
- Port 3000 available

### Running the Application

1. **Load the Docker Image**
   ```bash
   docker load < etablissement-app.tar
   ```

2. **Run the Container**
   ```bash
   docker run -p 3000:3000 etablissement-app
   ```

3. **Access the Application**
   - Open your web browser
   - Navigate to `http://localhost:3000`

### Environment Variables
The application requires the following environment variables:
- `NEXT_PUBLIC_API_URL`: The URL of your API (default: http://hamzaepicness.atwebpages.com)

To set environment variables when running the container:
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=your_api_url etablissement-app
```

### Troubleshooting

1. **Port Already in Use**
   If port 3000 is already in use, you can map to a different port:
   ```bash
   docker run -p 3001:3000 etablissement-app
   ```
   Then access the application at `http://localhost:3001`

2. **Container Not Starting**
   Check the logs:
   ```bash
   docker logs <container_id>
   ```

3. **Permission Issues**
   If you encounter permission issues, try running with sudo (Linux/Mac) or as administrator (Windows)

### Stopping the Application
To stop the container:
```bash
docker stop <container_id>
```

To find the container ID:
```bash
docker ps
```

## Support
If you encounter any issues, please contact the development team.
