GitHub Actions - example pipeline (simplified)
=============================================

name: CI

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install
        run: npm install
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm test
      - name: Build Docker image
        run: |
          docker build -t membershipauto/backend:latest .
          echo "Login to ECR etc..."

