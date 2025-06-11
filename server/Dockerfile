FROM golang:latest as build

WORKDIR /build
COPY . .
RUN go get ./...
RUN go build -o app ./cmd

FROM alpine:latest as run
WORKDIR /app
COPY --from=build /build/app .
ENTRYPOINT [ "app/app" ]
