# CI/CD Pipeline Documentation

This document provides an overview of the Continuous Integration and Continuous Deployment (CI/CD) pipelines for the Kenecare API, configured using GitHub Actions.

## Overview

Our CI/CD process is designed to automate testing, building, and deploying the application to ensure code quality and streamline the release process. The workflows are defined in the `.github/workflows` directory.

The main pipeline involves the following key stages:
1.  **Testing**: Running linting and unit tests on every push to specific branches.
2.  **Building**: Creating a Docker image of the application.
3.  **Scanning**: Scanning the Docker image for security vulnerabilities.
4.  **Signing**: Signing the Docker image for integrity.
5.  **Deploying**: Deploying the image to the staging or production environment.

## Workflows

### 1. Main CI/CD Pipeline (`test-build-push-deploy.yml`)

This is the primary workflow for testing, building, and deploying the application.

#### Triggers

This workflow is triggered by:
-   A `push` to `hotfix` or `hotfix/*` branches.
-   A manual trigger (`workflow_dispatch`) from the GitHub Actions tab, which allows for deployment to either the **staging** or **production** environment.

#### Jobs

The workflow consists of the following jobs:

1.  **`run-tests`**:
    -   Runs on an `ubuntu-latest` runner.
    -   Checks out the source code.
    -   Installs `npm` dependencies.
    -   Runs `npm run lint` to check for code style issues.
    -   Runs `npm test` to execute unit tests.

2.  **`build-and-scan-image`**:
    -   This job runs only if the `run-tests` job succeeds.
    -   It builds a multi-platform (linux/amd64, linux/arm64) Docker image using `Dockerfile.prod`.
    -   The image is tagged with `{environment}-1.0.{run_number}` (e.g., `staging-1.0.123`).
    -   The image is pushed to Docker Hub at `kenecare/kenecare-api`.
    -   **Security Scanning**: The Docker image is scanned for `critical` and `high` severity vulnerabilities using **Docker Scout**.
    -   **Image Signing**: The pushed image is signed using `cosign` for supply chain security.

3.  **`deploy-to-prod`**:
    -   This job runs on a self-hosted runner (`imotechsl-apps`) if `build-and-scan-image` is successful.
    -   It handles deployment to both **staging** and **production** environments based on the trigger event.
    -   **Environment Setup**: It copies the correct environment variables file (`.env.production` or `.env.staging`).
    -   **Deployment**: It uses `docker-compose` and a `Makefile` command (`make deploy-prod`) to stop the old container and start a new one with the newly built image.
    -   **Health Checks**: It performs a health check after deployment to ensure the service is running correctly.
    -   **Cleanup**: It prunes old, dangling Docker images to save disk space.
    -   **Rollback Preparation**: It saves the tag of the previously deployed image to `~/.last_kenecare_api_deployed_image` on the runner to facilitate quick rollbacks.

### 2. Rollback Workflow (`rollback.yml`)

This workflow allows for manually rolling back a deployment to the previously deployed version.

#### Trigger

This workflow is triggered manually (`workflow_dispatch`) and requires specifying the environment (`staging` or `prod`) to roll back.

#### Process

1.  The workflow runs on the `imotechsl-apps` self-hosted runner.
2.  It reads the image tag of the last successful deployment from `~/.last_kenecare_api_deployed_image`.
3.  It stops the current running application container.
4.  It redeploys the application using the previous image tag.
5.  It verifies the rollback by performing a health check.

### 3. New Relic Change Tracking (`new-relic-change-tracking.yml`)

This workflow integrates with New Relic to mark deployments.

#### Trigger

This workflow is triggered automatically when a new release is `published` on GitHub.

#### Process

-   It creates a "deployment marker" in New Relic.
-   This helps in correlating deployment events with application performance metrics in New Relic, making it easier to identify if a deployment caused a change in performance.

### 4. Dependency Updates (`dependabot.yml`)

This is not a workflow, but a configuration for GitHub's Dependabot to keep dependencies up-to-date.

-   **NPM Dependencies**: Dependabot checks for updates to `npm` packages monthly and creates pull requests to the `development` branch.
-   **GitHub Actions**: Dependabot also checks for updates to the GitHub Actions used in the workflows on a weekly basis.

## Environment Secrets

The CI/CD pipelines use the following secrets, which must be configured in the GitHub repository settings:

-   `NEW_RELIC_API_KEY`: API key for New Relic integration.
-   `NEW_RELIC_DEPLOYMENT_ENTITY_GUID`: The GUID of the application entity in New Relic.
-   `DOCKER_USERNAME`: Username for the Docker Hub registry.
-   `DOCKER_PASSWORD`: Password for the Docker Hub registry.
-   `COSIGN_PRIVATE_KEY`: Private key for signing Docker images with Cosign.
-   `COSIGN_PASSWORD`: Password for the Cosign private key.

This documentation should provide a clear understanding of our CI/CD processes. For more details, refer to the individual workflow files in the `.github/workflows` directory.
