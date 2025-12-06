SHELL := /bin/bash
.ONESHELL:

build:
	docker compose build

run:
	docker compose up -d

logs:
	docker compose logs -f

stop:
	docker compose down

migrate:
	docker compose exec api node migrate.js || true

test:
	echo "Add tests here"

deploy:
	echo "Use Helm/Terraform under deploy/ and infra/"
