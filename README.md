# Kenecare API

This is the backend API for the Kenecare platform. It provides the necessary endpoints for the frontend applications (web and mobile) to interact with the Kenecare system.

## Table of Contents

- [Kenecare API](#kenecare-api)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
  - [API Documentation](#api-documentation)
  - [Testing](#testing)
  - [Linting and Formatting](#linting-and-formatting)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
  - [License](#license)

## Project Overview

The Kenecare API is a robust and scalable backend service that powers the Kenecare platform. It handles user authentication, appointment management, patient records, and more. The API is built with Node.js and Express, and it uses a MySQL database for data storage and Redis for caching.

## Features

- User authentication and authorization
- Appointment scheduling and management
- Patient medical records management
- Doctor and patient profiles
- Secure payment processing
- Real-time notifications

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Caching:** Redis
- **Authentication:** JWT, Passport.js
- **File Storage:** AWS S3
- **Containerization:** Docker
- **Testing:** Jest, Supertest
- **Linting:** ESLint
- **Formatting:** Prettier

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [MySQL](https://www.mysql.com/downloads/)
- [Redis](https://redis.io/topics/quickstart)

## Getting Started

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/imotech/kenecare-api.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd kenecare-api
    ```

3.  Install the dependencies:

    ```bash
    npm install
    ```

4.  Create a `.env.dev` file in the root of the project and add the necessary environment variables. You can use the `sample-env.txt` file as a template.

### Running the Application

You can run the application using Docker or locally with Node.js.

**Using Docker (Recommended)**

1.  Start the application using Docker Compose:

    ```bash
    docker-compose -f docker-compose.api-dev.yml up --build
    ```

The API will be accessible at `http://localhost:8500`.

**Locally with Node.js**

1.  Start the application in development mode:

    ```bash
    npm run start:dev
    ```

The API will be accessible at `http://localhost:8000`.

## API Documentation

The API is documented using Swagger. Once the application is running, you can access the Swagger UI at `http://localhost:8500/api-docs`.

## Testing

To run the tests, use the following command:

```bash
npm test
```

## Linting and Formatting

To lint the code, use the following command:

```bash
npm run lint
```

To fix linting errors, use the following command:

```bash
npm run lint:fix
```

To format the code, use the following command:

```bash
npm run format
```

## Deployment

The application is deployed using Docker. The `Dockerfile.prod` and `docker-compose.api-prod.yml` files are used for production deployments.

## Makefile Commands

The project includes a `Makefile` with various commands to automate common tasks. Here are some of the most useful commands:

| Command | Description |
| --- | --- |
| `make help` | Displays a help message with all available commands. |
| `make build-dev` | Builds the Docker image for the development environment. |
| `make build-staging` | Builds the Docker image for the staging environment. |
| `make build-prod` | Builds the Docker image for the production environment. |
| `make run-dev` | Runs the entire stack in development mode (DB, Redis, API). |
| `make stop-dev` | Stops the entire development stack. |
| `make run-db` | Runs only the database service. |
| `make stop-db` | Stops the database service. |
| `make run-redis` | Runs only the Redis service. |
| `make stop-redis` | Stops the Redis service. |
| `make run-api` | Runs only the API service. |
| `make stop-api` | Stops the API service. |
| `make run-staging` | Deploys the application to staging. |
| `make stop-staging` | Stops the staging environment. |
| `make deploy-prod` | Deploys the application to production. |
| `make stop-prod` | Stops the production environment. |
| `make rollback` | Rolls back the production deployment to the previous image. |
| `make test-deploy` | Performs a health check after a production deployment. |
| `make push-staging-image` | Pushes the staging Docker image to the registry. |
| `make push-production-image` | Pushes the production Docker image to the registry. |
| `make logs` | Streams logs for the API service. |
| `make redis-cli` | Opens Redis CLI for the development environment. |
| `make flush-cache` | Flushes Redis cache for the development environment. |
| `make clean` | Cleans up all Docker containers, networks, and volumes. |

## Contributing

Contributions are welcome! Please read our [contributing guidelines](.github/CONTRIBUTING.md) to get started.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
