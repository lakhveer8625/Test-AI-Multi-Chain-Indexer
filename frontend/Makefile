.PHONY: help build run stop clean logs shell test

# Variables
IMAGE_NAME := lak-frontend
CONTAINER_NAME := lak-frontend
VERSION := latest
PORT := 3000

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
	docker build -t $(IMAGE_NAME):$(VERSION) .

run: ## Run the container
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):3000 \
		$(IMAGE_NAME):$(VERSION)

stop: ## Stop the container
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

restart: stop run ## Restart the container

logs: ## Show container logs
	docker logs -f $(CONTAINER_NAME)

shell: ## Open a shell in the running container
	docker exec -it $(CONTAINER_NAME) /bin/sh

clean: stop ## Remove container and image
	docker rmi $(IMAGE_NAME):$(VERSION) || true

rebuild: clean build run ## Rebuild and run the container

compose-up: ## Start services with docker-compose
	docker-compose up -d

compose-down: ## Stop services with docker-compose
	docker-compose down

compose-logs: ## Show docker-compose logs
	docker-compose logs -f

compose-rebuild: ## Rebuild and restart with docker-compose
	docker-compose down
	docker-compose up --build -d

test: ## Run tests in container
	docker run --rm $(IMAGE_NAME):$(VERSION) npm test

prune: ## Remove all stopped containers and unused images
	docker system prune -f

stats: ## Show container resource usage
	docker stats $(CONTAINER_NAME)

inspect: ## Show detailed container information
	docker inspect $(CONTAINER_NAME)

push: ## Push image to registry (set REGISTRY variable)
	@if [ -z "$(REGISTRY)" ]; then \
		echo "Error: REGISTRY variable not set. Usage: make push REGISTRY=your-registry.com"; \
		exit 1; \
	fi
	docker tag $(IMAGE_NAME):$(VERSION) $(REGISTRY)/$(IMAGE_NAME):$(VERSION)
	docker push $(REGISTRY)/$(IMAGE_NAME):$(VERSION)
