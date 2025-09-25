REGISTRY = docker.io
IMAGE_NAME = kenecare/kenecare-api
CURRENT_IMAGE_TAG ?= $(TAG)
# OLD_IMAGE_TAG stores the tag of the previously deployed image for rollback.
OLD_IMAGE_TAG = $(shell cat .last_deployed_image 2>/dev/null || echo "")


# Define Docker Compose files for different environments.
# These assume you have `docker-compose.db.yml`, `docker-compose.api.yml`,
# `docker-compose.staging.yml`, and `docker-compose.prod.yml` configured appropriately.
DOCKER_COMPOSE_DB = docker-compose.db.yml
DOCKER_COMPOSE_REDIS = docker-compose.redis.yml
DOCKER_COMPOSE_API = docker-compose.api-dev.yml
DOCKER_COMPOSE_STAGING = docker-compose.staging.yml
DOCKER_COMPOSE_PROD = docker-compose.api-prod.yml

# Define environment files for different environments
ENV_FILE_DEV = .env.development
ENV_FILE_PROD = .env.production
ENV_FILE_STAGING = .env.staging
ENV_FILE_DB = .env.db.development # @Roland I changed this from "db.env" to ".env.db.development"
ENV_FILE_REDIS = .env.redis.development # @Roland I changed this from "redis.env" to ".env.redis.development"

# Service names as defined in Docker Compose files
DB_SERVICE_NAME = mysql-db
REDIS_SERVICE_NAME = redis
API_SERVICE_NAME = api

# Default target
.DEFAULT_GOAL := help


.PHONY: help
help:
	@echo "Usage: make <command>"
	@echo ""
	@echo "General Commands:"
	@echo "  help                     Display this help message."
	@echo "  check-env                Check for essential environment files."
	@echo ""
	@echo "Build Commands:"
	@echo "  build-dev                Build the Docker image for the development environment."
	@echo "  build-staging            Build the Docker image for the staging environment."
	@echo "  build-prod               Build the Docker image for the production environment."
	@echo ""
	@echo "Run Commands (Development Focus):"
	@echo "  run-dev                  Run the entire stack in development mode (DB, Redis, API)."
	@echo "  stop-dev                 Stop the entire development stack."
	@echo "  run-db                   Run only the database service for the current ENV."
	@echo "  stop-db                  Stop the database service for the current ENV."
	@echo "  run-redis                Run only the Redis service for the current ENV."
	@echo "  stop-redis               Stop the Redis service for the current ENV."
	@echo "  run-api                  Run only the API service for the current ENV."
	@echo "  stop-api                 Stop the API service for the current ENV."
	@echo ""
	@echo "Deployment Commands (Staging/Production):"
	@echo "  run-staging              Deploy the application to staging."
	@echo "  stop-staging             Stop the staging environment."
	@echo "  deploy-prod              Deploy the application to production."
	@echo "  stop-prod                Stop the production environment."
	@echo "  rollback                 Rollback production deployment to the previous image."
	@echo "  test-deploy              Perform a health check after a production deployment."
	@echo ""
	@echo "Image Management Commands:"
	@echo "  push-staging-image       Push the staging Docker image to the registry."
	@echo "  push-production-image    Push the production Docker image to the registry."
	@echo ""
	@echo "Utility Commands:"
	@echo "  logs                     Stream logs for the API service (development)."
	@echo "  redis-cli                Open Redis CLI for the development environment."
	@echo "  flush-cache              Flush Redis cache for the development environment."
	@echo "  clean                    Clean up all Docker containers, networks, and volumes."


# Default environment
ENV ?= 

ifeq ($(findstring build-prod,$(MAKECMDGOALS)),build-prod)
  ENV := production
endif

ifeq ($(findstring deploy-prod,$(MAKECMDGOALS)),deploy-prod)
  ENV := production
endif
ifeq ($(findstring test-deploy,$(MAKECMDGOALS)),test-deploy)
  ENV := production
endif

ifeq ($(findstring rollback-prod,$(MAKECMDGOALS)),rollback-prod)
  ENV := production
endif


ifeq ($(findstring run-api,$(MAKECMDGOALS)),run-api)
	ENV := development
endif
ifeq ($(findstring stop-api,$(MAKECMDGOALS)),stop-api)
	ENV := development
endif
ifeq ($(findstring run-dev,$(MAKECMDGOALS)),run-dev)
	ENV := development
endif

ifeq ($(findstring run-staging,$(MAKECMDGOALS)),run-staging)
	ENV := staging
endif


ifeq ($(findstring check-db-status,$(MAKECMDGOALS)),check-db-status)
	ENV := development
endif

ifeq ($(findstring run-db,$(MAKECMDGOALS)),run-db)
	ENV := development
endif

ifeq ($(findstring check-redis-status,$(MAKECMDGOALS)),check-redis-status)
	ENV := development
endif 

ifeq ($(findstring run-redis,$(MAKECMDGOALS)),run-redis)
	ENV := development
endif 

ifeq ($(findstring flush-cache,$(MAKECMDGOALS)),flush-cache)
	ENV := development
endif

ifeq ($(findstring check-env,$(MAKECMDGOALS)),check-env)
	ENV := development
endif


.PHONY: check-env
check-env:
	@echo "Checking for .env.${ENV} environment file..."
	@if [ ! -f .env.${ENV} ]; then \
		echo "❌ Error: .env.${ENV} file not found! Please create it or set ENV correctly."; \
		exit 1; \
	fi
	@echo "✅ Environment file .env.${ENV} found."

# Internal check to see if a Docker Compose service is running
# Usage: $(call is-service-running, <service_name>)
define is-service-running
	docker ps --filter "name=$(1)" --filter "status=running" -q | grep -q .
endef

.PHONY: check-db-status
check-db-status: check-env
	@echo "Checking $(DB_SERVICE_NAME) service status..."
	@if $(call is-service-running, $(DB_SERVICE_NAME)); then \
		echo "$(DB_SERVICE_NAME) is already running."; \
		read -p "Do you want to use the existing $(DB_SERVICE_NAME) container? [y/N] " response; \
		if [ "$$response" != "y" ] && [ "$$response" != "Y" ]; then \
			echo "⚠️ Please stop the existing $(DB_SERVICE_NAME) container first using 'make stop-db'."; \
			exit 1; \
		fi; \
	else \
		echo "$(DB_SERVICE_NAME) is not running."; \
		$(MAKE) run-db; \
	fi

.PHONY: check-redis-status
check-redis-status: check-env
	@echo "Checking $(REDIS_SERVICE_NAME) service status..."
	@if $(call is-service-running, $(REDIS_SERVICE_NAME)); then \
		echo "$(REDIS_SERVICE_NAME) is already running."; \
		read -p "Do you want to use the existing $(REDIS_SERVICE_NAME) container? [y/N] " response; \
		if [ "$$response" != "y" ] && [ "$$response" != "Y" ]; then \
			echo "⚠️ Please stop the existing $(REDIS_SERVICE_NAME) container first using 'make stop-redis'."; \
			exit 1; \
		fi; \
	else \
		echo "$(REDIS_SERVICE_NAME) is not running."; \
		$(MAKE) run-redis; \
	fi

# ==============================================================================
# Build Commands
# ==============================================================================

.PHONY: build-dev
build-dev: check-env
	@echo "Building Docker image for development: $(IMAGE_NAME):development"
	@ENV=$(ENV) docker build -t $(IMAGE_NAME):development .

.PHONY: build-staging
build-staging: check-env
	@echo "Building Docker image for staging: $(IMAGE_NAME):staging-$(CURRENT_IMAGE_TAG)"
	@ENV=staging docker build --pull -t $(IMAGE_NAME):staging-$(CURRENT_IMAGE_TAG) -f Dockerfile.staging .

.PHONY: build-prod
build-prod: check-env
	@echo "Building Docker image for production: $(REGISTRY)/$(IMAGE_NAME):prod-$(CURRENT_IMAGE_TAG)"
	@sleep 5
	@ENV=production docker build -t $(REGISTRY)/$(IMAGE_NAME):prod-$(CURRENT_IMAGE_TAG) -f Dockerfile.prod .

# ==============================================================================
# Run Commands (Development Focused)
# ==============================================================================

.PHONY: run-db
run-db: check-env
	@echo "Starting $(DB_SERVICE_NAME) service..."
	@ENV=$(ENV) docker compose -f $(DOCKER_COMPOSE_DB) --env-file=$(ENV_FILE_DEV) up -d $(DB_SERVICE_NAME)
	@echo "Waiting for $(DB_SERVICE_NAME) to be ready (10s)..."
	@sleep 10

.PHONY: stop-db
stop-db:
	@echo "Stopping $(DB_SERVICE_NAME) service..."
	@ENV=$(ENV) docker compose -f $(DOCKER_COMPOSE_DB) --env-file=$(ENV_FILE_DEV) stop $(DB_SERVICE_NAME)

.PHONY: run-redis
run-redis: check-env
	@echo "Starting $(REDIS_SERVICE_NAME) service..."
	@ENV=$(ENV) docker compose -f $(DOCKER_COMPOSE_REDIS) --env-file=$(ENV_FILE_REDIS) up -d $(REDIS_SERVICE_NAME)
	@echo "Waiting for $(REDIS_SERVICE_NAME) to be ready (5s)..."
	@sleep 5

.PHONY: stop-redis
stop-redis:
	@echo "Stopping $(REDIS_SERVICE_NAME) service..."
	@ENV=$(ENV) docker compose -f $(DOCKER_COMPOSE_REDIS) --env-file=$(ENV_FILE_DEV) stop $(REDIS_SERVICE_NAME)

.PHONY: run-api
run-api: check-env check-db-status check-redis-status
	@echo "Starting $(API_SERVICE_NAME) service..."
	@ENV=$(ENV) docker compose -f $(DOCKER_COMPOSE_API) --env-file=$(ENV_FILE_DEV) up -d --build $(API_SERVICE_NAME) 

.PHONY: stop-api
stop-api:
	@echo "Stopping $(API_SERVICE_NAME) service..."
	@ENV=$(ENV) docker compose -f $(DOCKER_COMPOSE_API) --env-file=$(ENV_FILE_DEV) stop $(API_SERVICE_NAME)

.PHONY: run-dev
run-dev: check-env run-db run-redis run-api
	@echo "🚀🚀Development environment is up and running🚀🚀"
	@echo "Access API at: http://localhost:8500 (or configured port)"

.PHONY: stop-dev
stop-dev: stop-api stop-redis stop-db
	@echo "Development environment has been stopped."

# ==============================================================================
# Deployment Commands (Staging/Production)
# ==============================================================================

.PHONY: run-staging
run-staging: check-env build-staging push-staging-image
	@echo "Deploying application to staging..."
	@ENV=staging docker compose --env-file=$(ENV_FILE_STAGING) -f $(DOCKER_COMPOSE_STAGING) up -d
	@echo "Staging deployment initiated."

.PHONY: stop-staging
stop-staging: check-env
	@echo "Stopping staging environment..."
	@ENV=staging docker compose --env-file=$(ENV_FILE_STAGING) -f $(DOCKER_COMPOSE_STAGING) down

.PHONY: deploy-prod
deploy-prod: check-env
	@echo "🚀 MAKEFILE: Deploying new production image: $(REGISTRY)/$(IMAGE_NAME):$(CURRENT_IMAGE_TAG)"
	@ENV=production TAG=$(CURRENT_IMAGE_TAG) docker compose --env-file=$(ENV_FILE_PROD) -f $(DOCKER_COMPOSE_PROD) up -d --force-recreate --remove-orphans
	@echo "$(CURRENT_IMAGE_TAG)" > ~/.last_kenecare_api_deployed_image 
	@echo "Deployment Successful!!"


.PHONY: stop-prod
stop-prod: check-env
	@echo "Stopping production environment..."
	@ENV=production TAG=$(CURRENT_IMAGE_TAG) docker compose --env-file=$(ENV_FILE_PROD) -f $(DOCKER_COMPOSE_PROD) down

.PHONY: rollback
rollback: check-env
	@echo "Attempting to rollback to previous image..."
	@if [ -z "$(OLD_IMAGE_TAG)" ]; then \
		echo "Error: No previous deployment record found in .last_deployed_image. Rollback aborted."; \
		exit 1; \
	fi
	@echo "Rolling back to previous image: $(REGISTRY)/$(IMAGE_NAME):$(OLD_IMAGE_TAG)"
	@ENV=production TAG=$(OLD_IMAGE_TAG) docker compose --env-file=$(ENV_FILE_PROD) -f $(DOCKER_COMPOSE_PROD) down
	@ENV=production TAG=$(OLD_IMAGE_TAG) docker compose --env-file=$(ENV_FILE_PROD) -f $(DOCKER_COMPOSE_PROD) up -d
	@echo "Rollback to $(OLD_IMAGE_TAG) successful!"

.PHONY: test-deploy
test-deploy: check-env
	@echo "Running health check for newly deployed image: $(REGISTRY)/$(IMAGE_NAME):$(CURRENT_IMAGE_TAG)"
	@sleep 10 # Give the service some time to start up and initialize
	@curl -f http://localhost:9500/api/v1/health-check || ( \
		echo "Health check failed for $(REGISTRY)/$(IMAGE_NAME):$(CURRENT_IMAGE_TAG). Attempting rollback..."; \
		$(MAKE) rollback; \
		exit 1; \
	)
	@echo "\n\nHealth check passed!"

# ==============================================================================
# Image Management Commands
# ==============================================================================

.PHONY: push-staging-image
push-staging-image: check-env
	@echo "Pushing staging image: $(IMAGE_NAME):staging"
	@docker push $(IMAGE_NAME):staging

.PHONY: push-production-image
push-production-image:
	@echo "Pushing production image: $(REGISTRY)/$(IMAGE_NAME):$(CURRENT_IMAGE_TAG)"
	@sleep 5 
	@docker push $(REGISTRY)/$(IMAGE_NAME):$(CURRENT_IMAGE_TAG)

# ==============================================================================
# Utility Commands
# ==============================================================================

.PHONY: logs
logs:
	@echo "Streaming logs for development API service: $(API_SERVICE_NAME)"
	@ENV=$(ENV) docker compose --env-file=$(ENV_FILE_DEV) -f $(DOCKER_COMPOSE_API) logs -f $(API_SERVICE_NAME)

.PHONY: redis-cli
redis-cli: check-env
	@echo "Opening Redis CLI for $(REDIS_SERVICE_NAME)..."
	# Assumes Redis service is running and accessible via docker compose exec
	@docker compose --env-file=$(ENV_FILE_REDIS) -f $(DOCKER_COMPOSE_REDIS) exec $(REDIS_SERVICE_NAME) redis-cli -a "$$(grep REDIS_PASSWORD $(ENV_FILE_REDIS) | cut -d '=' -f2)"

.PHONY: flush-cache
flush-cache: check-env
	@echo "Flushing Redis cache for $(REDIS_SERVICE_NAME)..."
	# Assumes Redis service is running and accessible via docker compose exec
	@docker compose --env-file=$(ENV_FILE_DEV) -f $(DOCKER_COMPOSE_REDIS) exec $(REDIS_SERVICE_NAME) redis-cli -a "$$(grep REDIS_PASSWORD $(ENV_FILE_REDIS) | cut -d '=' -f2)" FLUSHALL
	@echo "Cache flushed successfully!"

.PHONY: clean
clean:
	@echo "Cleaning up all Docker containers, networks, and volumes..."
	# Stop and remove services defined in development compose files
	@docker compose --env-file=$(ENV_FILE_DEV) -f $(DOCKER_COMPOSE_API) -f $(DOCKER_COMPOSE_DB) down --volumes --remove-orphans
	# Also clean up potentially leftover production/staging artifacts if they use different networks/volumes
	@docker system prune -f --volumes
	@echo "Docker cleanup complete!"