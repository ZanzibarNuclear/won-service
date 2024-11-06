# API for Auth Service and Flux Service

This is the backing API that supports user authentication and authorization, as well as the
World of Nuclear Flux service.

## Architecture

These micro-services are built using Fastify, a web framework that is designed to be fast and efficient.
If these work out, we can always separate them into their own endpoints and even projects. Until then,
let's keep this simple and efficient.

Behind these services is a PostgreSQL database for data persistence. This project has code for database
schema migrations, using Kysely, as well as code for setting up database instances and roles.

For hosted environments (as opposed to local development), we front these services with nginx. This
allows us to manage traffic, apply security policies, and support a highly available configuration.
We use nginx for SSL termination, as well as for load balancing and routing to separate instances:
staging, production, etc.

## Inventory

## Getting Started
