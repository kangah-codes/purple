# Build stage
FROM golang:1.22.1-alpine AS builder

# Install git and basic build tools
RUN apk add --no-cache git make gcc libc-dev

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /app/bin/main ./cmd/api

# Final stage
FROM alpine:3.19

# Install ca-certificates for HTTPS requests and tzdata for time zones
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Set working directory
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/bin/main .

# Copy necessary configuration files
COPY --from=builder /app/.env .

# Set environment variables
ENV GIN_MODE=release \
    TZ=UTC

# Use non-root user
USER app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Command to run the application
CMD ["./main"]