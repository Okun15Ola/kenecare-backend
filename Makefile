build-dev:
	@ENV=development docker build -t imotechsl/kenecare-admin:development . 

build-prod:
	@ENV=production docker build -t imotechsl/kenecare-admin:production -f Dockerfile.prod . 



run-dev:
	@ENV=development docker compose up --build
stop-dev:
	@ENV=development docker compose down -v
	

run-prod:
	@ENV=production docker compose --env-file=production.env  -f docker-compose-prod.yml up -d
	
	
stop-prod:
	@ENV=production docker compose --env-file=production.env -f docker-compose-prod.yml down 
	

build-dev-all:
	@$(MAKE) build-dev
	@cd nginx && $(MAKE) build-nginx-dev

push-image:
	@docker push imotechsl/kenecare-admin:production