FILES ?= $(shell find . -type f -iname '*md' ! -path "./node_modules/*" ! -path "./build/" )

cspell-test:
	@echo "$(YELLOW)'make cspell-test': Checking spelling...$(NC)"
	@docker run \
		--name=cspell \
		--rm \
		--user `id -u`:`id -g` \
		-w "/usr/local/app" \
		-v "$(PWD):/usr/local/app" \
		-t ghcr.io/streetsidesoftware/cspell:6.10.1 \
		cspell --words-only --unique "**/**" -c .cspell.config.yaml

link-test:
	@echo "$(YELLOW)'make link-test': Checking if all document links are valid...$(NC)"
	@docker run \
		--name=md-link-test \
		--rm \
		--user `id -u`:`id -g` \
		-w "/usr/src/app" \
		-v "$(PWD):/usr/src/app" \
		ghcr.io/tcort/markdown-link-check:stable \
		--config=.link-checker.config.json \
		--quiet \
		$(FILES)

test: cspell-test link-test