FROM golang:1.24 as build

WORKDIR /app
COPY . .
RUN go get ./...
RUN go build -o main ./cmd

FROM alpine:latest as run
WORKDIR /app
COPY --from=build /build/app .
ENTRYPOINT [ "app/main" ]
