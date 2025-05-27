# Variables
REGISTRY=docker.io
IMAGE_NAME=imotechsl/kenecare-api
CURRENT_IMAGE_TAG=1.0.$(RUN_NUMBER)
OLD_IMAGE_TAG=$(shell echo $$(cat .last_deployed_image))

build-dev:
	@ENV=development docker build -t imotechsl/kenecare-api:development . 

build-staging:
	@ENV=staging docker build --pull -t imotechsl/kenecare-api:staging -f Dockerfile.staging .

build-prod:
	@ENV=production docker build -t $(REGISTRY)/$(IMAGE_NAME):$(CURRENT_IMAGE_TAG) -f Dockerfile.prod . 


run-dev:
	@ENV=development  docker compose --env-file=.env.development up --build 
stop-dev:
	@ENV=development  docker compose --env-file=.env.development down
	

run-prod:
	@echo "Deploying new image: $(IMAGE_NAME):$(CURRENT_IMAGE_TAG)"
	@ENV=production TAG=$(CURRENT_IMAGE_TAG) docker compose --env-file=.env.production  -f docker-compose-prod.yml up -d
	@echo "$(CURRENT_IMAGE_TAG)" > .last_deployed_image 
	@echo "Deployment Successful!!"
 

# rollback: 
# 	@echo "Rolling back to previous image: $(IMAGE_NAME):$(OLD_IMAGE_TAG)"
# 	if [ -z "$(OLD_IMAGE_TAG)" ]; then \
# 		  echo "No previous deployment record found. Rollback aborted."; \
#       exit 1; \
# 	fi

# 	@ENV=production TAG=$(TAG) docker compose --env-file=.env.production  -f docker-compose-prod.yml down

# 	@ENV=production TAG=$(OLD_IMAGE_TAG) docker compose --env-file=.env.production  -f docker-compose-prod.yml up -d



stop-prod:
	@ENV=production TAG=$(TAG) docker compose --env-file=.env.production  -f docker-compose-prod.yml down

run-staging:
	@ENV=staging docker compose --env-file=.env  -f docker-compose-staging.yml up -d
	
stop-staging:
	@ENV=staging docker compose --env-file=.env  -f docker-compose-staging.yml down
	
	

	

push-staging-image:
	@docker push imotechsl/kenecare-api:staging

push-production-image:
	@docker push $(REGISTRY)/$(IMAGE_NAME):$(CURRENT_IMAGE_TAG)

logs:
	@ENV=development docker logs -f kenecare-api-development



test-deploy:
	@echo "Testing deployment for: $(IMAGE_NAME):$(CURRENT_IMAGE_TAG)"
	@curl -f http://localhost:8500/api/v1/health-check || ( \
		 echo "Health check failed. Rolling back..."; \
		 exit 1; \
	)

# cleanup:
# 	@echo "Cleaning up unused resources..."
#     docker system prune -f