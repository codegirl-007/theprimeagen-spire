PORT ?= 8000

.PHONY: server
server:
	python3 -m http.server $(PORT)
