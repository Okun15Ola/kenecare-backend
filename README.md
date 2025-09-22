# Kenecare API

This is the backend API for the Kenecare platform. It provides the necessary endpoints for the frontend applications (web and mobile) to interact with the Kenecare system.

## Table of Contents

- [Kenecare API](#kenecare-api)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Dependencies and Scripts](#dependencies-and-scripts)
    - [Key Dependencies](#key-dependencies)
    - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
      - [Using Docker (Recommended)](#using-docker-recommended)
      - [Locally with Node.js](#locally-with-nodejs)
  - [Testing](#testing)
  - [Linting and Formatting](#linting-and-formatting)
  - [Deployment](#deployment)
  - [Makefile Commands](#makefile-commands)
  - [Contributing](#contributing)
  - [License](#license)

## Project Overview

The Kenecare API is a robust and scalable backend service that powers the Kenecare platform. It handles user authentication, appointment management, patient records, and more. The API is built with Node.js and Express, and it uses a MySQL database for data storage and Redis for caching.

## Features

- **User & Profile Management**
  - User authentication and authorization
  - Doctor and patient profiles
  - Doctor review management
- **Appointment & Scheduling**
  - Appointment scheduling and management
  - Doctor appointment follow-up management
  - Doctor availability management
- **Medical Records & Prescriptions**
  - Patient medical records management
  - Medical prescription and management
  - Secured medical records sharing
- **Content & Communication**
  - Doctor health blog management
  - Doctor FAQ management
  - Push notifications
- **Financial & Payments**
  - Secure payment processing
  - Doctor wallet management

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Caching:** Redis
- **Authentication:** JWT
- **File Storage:** AWS S3
- **Containerization:** Docker
- **Testing:** Jest, Supertest
- **Linting:** ESLint
- **Formatting:** Prettier

## Dependencies and Scripts

This project uses a variety of packages to provide functionality and streamline development.

### Key Dependencies

- **Core Framework:** **`express`** is the main web framework.
- **Database & Caching:** **`mysql2`** is used for database interaction. **`ioredis`** is the client for Redis.
- **Authentication & Security:** **`bcryptjs`** for password hashing, **`jsonwebtoken`** for authentication with JWTs **`helmet`** provides essential security headers.
- **Cloud Services:** The **`@aws-sdk`** packages handle interactions with AWS services like S3 and Secrets Manager. **`twilio`** is used for SMS communication.
- **Utilities:** **`moment`** for date & time handling, **`cron`** for scheduling jobs, **`dotenv`** for environment variables, and **`winston`** for logging.

### Available Scripts

The following scripts are defined in `package.json` for development, testing, and deployment.

| Script | Description |
| :--- | :--- |
| `npm run start` | Starts the application in production mode using the pre-built bundle. |
| `npm run start:prod` | Starts the application in production mode directly from source files. |
| `npm run start:dev` | Starts the application in development mode with **`nodemon`** for automatic restarts on file changes. |
| `npm test` | Runs all tests using **`jest`**, clearing the cache and detecting potential memory leaks. |
| `npm run lint` | Lints the codebase to check for style and quality issues. |
| `npm run lint:fix` | Automatically fixes all fixable linting errors. |
| `npm run prepare` | A hook that runs **`husky`** installation, setting up Git hooks for pre-commit checks. |
| `npm run build` | Builds the production-ready code bundle using **`webpack`**. |
| `npm run format` | Formats all code files using **`prettier`** to ensure consistent style. |

## Project Structure

Project structure is as follows:

- `src/`: Contains all of the application's source code.
  - `config/`: Configuration files for various services.
  - `constants/`: Application-wide constant values.
  - `controllers/`: Request handlers for API endpoints.
  - `jobs/`: Background tasks and cron jobs.
  - `logs/`: Log files for the application.
  - `middlewares/`: Express middleware functions.
  - `public/`: Static assets and public-facing files.
  - `repository/`: Database interaction logic and data access objects.
  - `routes/`: API endpoint definitions and routing.
  - `services/`: Business logic and core application services.
  - `utils/`: Helper functions and utilities.
  - `validations/`: Data validation schemas and logic.
  - `app.js`: Main application entry point.
  - `check-env.js`: Script to validate environment variables.
  - `server.js`: Server setup and startup script.
- `sql-scripts/`: SQL scripts for database setup and migrations.
- `tests/`: Test files for unit and integration testing.
- `node_modules/`: Project dependencies.
- `.env.*`: Environment configuration files for different environments (development, staging, production).
- `docker-compose.*.yml`: Docker Compose files for running the application stack.
- `sample.env`: Environment Variables required for running the application
- `sample.env.db`: Environment Variables required for running MYSQL database
- `sample.env.redis`: Environment Variables required for running REDIS
- `Dockerfile`: Dockerfile for building the application image.
- `jest.config.js`: Jest testing framework configuration.
- `Makefile`: Commands to automate common development and deployment tasks.
- `package.json`: Project metadata and dependencies.
- `README.md`: Project's main documentation.

---

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [MySQL](https://www.mysql.com/downloads/)
- [Redis](https://redis.io/topics/quickstart)

## Getting Started

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/imotech/kenecare-api.git
    ```

2. Navigate to the project directory:

    ```bash
    cd kenecare-api
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

4. Create a `.env.development` file in the root of the project and add the necessary environment variables. You can use the `sample.env.txt` file as a template. Repeat the same for `.env.db.devlopment` use `sample.env.db` and `.env.redis.development` use `sample.env.redis`

### Running the Application

You can run the application using Docker or locally with Node.js.

#### Using Docker (Recommended)

1. Start the application using Docker Compose:

    ```bash
    make run-dev
    ```

The API will be accessible at `http://localhost:8500`.

#### Locally with Node.js

1. Start the application in development mode:

    ```bash
    npm run start:dev
    ```

The API will be accessible at `http://localhost:8000`.

<!-- ## API Documentation

The API is documented using Swagger. Once the application is running, you can access the Swagger UI at `http://localhost:8500/api-docs`. -->

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

| Command                      | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `make help`                  | Displays a help message with all available commands.        |
| `make build-dev`             | Builds the Docker image for the development environment.    |
| `make build-staging`         | Builds the Docker image for the staging environment.        |
| `make build-prod`            | Builds the Docker image for the production environment.     |
| `make run-dev`               | Runs the entire stack in development mode (DB, Redis, API). |
| `make stop-dev`              | Stops the entire development stack.                         |
| `make run-db`                | Runs only the database service.                             |
| `make stop-db`               | Stops the database service.                                 |
| `make run-redis`             | Runs only the Redis service.                                |
| `make stop-redis`            | Stops the Redis service.                                    |
| `make run-api`               | Runs only the API service.                                  |
| `make stop-api`              | Stops the API service.                                      |
| `make run-staging`           | Deploys the application to staging.                         |
| `make stop-staging`          | Stops the staging environment.                              |
| `make deploy-prod`           | Deploys the application to production.                      |
| `make stop-prod`             | Stops the production environment.                           |
| `make rollback`              | Rolls back the production deployment to the previous image. |
| `make test-deploy`           | Performs a health check after a production deployment.      |
| `make push-staging-image`    | Pushes the staging Docker image to the registry.            |
| `make push-production-image` | Pushes the production Docker image to the registry.         |
| `make logs`                  | Streams logs for the API service.                           |
| `make redis-cli`             | Opens Redis CLI for the development environment.            |
| `make flush-cache`           | Flushes Redis cache for the development environment.        |
| `make clean`                 | Cleans up all Docker containers, networks, and volumes.     |

## Contributing

Contributions are welcome! Please read our [contributing guidelines](.github/CONTRIBUTING.md) to get started.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
