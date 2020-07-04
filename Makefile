serve: build
	@python3 -m http.server 8080
build:
	@rm -rf beta_*
	@rm -rf article_*
	@cat articles.yaml | yq . > articles.json
	@node generate.js articles.json ./ beta
lint:
	@prettier --write articles.yaml
