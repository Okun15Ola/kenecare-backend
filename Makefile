build-dev:
	@ENV=development docker build -t imotechsl/kenecare-api:development . 

build-staging:
	@ENV=staging docker build --pull -t imotechsl/kenecare-api:staging -f Dockerfile.staging .

build-prod:
	@ENV=production docker build -t imotechsl/kenecare-api:production -f Dockerfile.prod . 



run-dev:
	@ENV=development  docker compose --env-file=.env.development up --build
stop-dev:
	@ENV=development  docker compose --env-file=.env.development down -v
	

run-prod:
	@ENV=production docker compose --env-file=production.env  -f docker-compose-prod.yml up -d

run-staging:
	@ENV=staging docker compose --env-file=.env  -f docker-compose-staging.yml up -d
	
stop-staging:
	@ENV=staging docker compose --env-file=.env  -f docker-compose-staging.yml down
	
	
stop-prod:
	@ENV=production docker compose --env-file=production.env -f docker-compose-prod.yml down  -v
	

push-staging-image:
	@docker push imotechsl/kenecare-api:staging

push-production-image:
	@docker push imotechsl/kenecare-api:production

logs:
	@ENV=development docker logs -f kenecare-api-development