# Depot Makefile

PKG := rideshare
VERSION ?= $(shell git describe --match 'v[0-9]*' --dirty='.m' --always --tags)

GO_LDFLAGS ?= -w -X ${PKG}/internal.Version=${VERSION}
BUILD_FLAGS =
EXECNAME = rideshare

.PHONY: all build lint test

all: lint test build

build: 
	go build ${BUILD_FLAGS} -ldflags "${GO_LDFLAGS}" -o build/${EXECNAME} ./cmd

test:
	go test ./...

lint:
	go fmt ./...

