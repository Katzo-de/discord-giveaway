# Discord Giveaway Bot

[![Build](https://github.com/Katzo-de/discord-giveaway/actions/workflows/build.yml/badge.svg)](https://github.com/Katzo-de/discord-giveaway/actions/workflows/build.yml)
[![Docker](https://github.com/Katzo-de/discord-giveaway/actions/workflows/docker.yml/badge.svg)](https://github.com/Katzo-de/discord-giveaway/actions/workflows/docker.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

DiscordGiveaway is a modern Discord bot built with TypeScript and Node.js. It simplifies running fair and engaging giveaways for your community using interactive slash commands, buttons, and modals.

## Features

- 🚀 **Slash Commands**: Intuitive commands for seamless interaction.
- 🎨 **Interactive UI**: Engaging user experience with Discord buttons and modals.
- 💾 **Persistent Storage**: Robust data management using MySQL.
- ⚖️ **Fair & Secure**: Random winner selection and duplicate entry prevention.
- 🐳 **Docker Ready**: Easy deployment with Docker support.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A supported database:
  - [MySQL](https://www.mysql.com/)
  - [PostgreSQL](https://www.postgresql.org/)
  - [SQLite](https://www.sqlite.org/) (no external server required, great for testing)
- A [Discord Bot Token](https://discord.com/developers/applications)

## Installation

### Method 1: Docker (Recommended)

1.  Create a `docker-compose.yml` file:

    ```yaml
    version: '3.8'
    services:
      bot:
        image: ghcr.io/katzo-de/discord-giveaway:latest
        restart: always
        environment:
          - DISCORD_TOKEN=your_token_here
          - DB_TYPE=mysql
          - DB_HOST=db
          - DB_USER=root
          - DB_PASSWORD=your_db_password
          - DB_NAME=discord_giveaway
        depends_on:
          - db

      db:
        image: mysql:8.0
        restart: always
        environment:
          - MYSQL_ROOT_PASSWORD=your_db_password
          - MYSQL_DATABASE=discord_giveaway
        volumes:
          - db_data:/var/lib/mysql

    volumes:
      db_data:
    ```

2.  Run the container:
    ```bash
    docker-compose up -d
    ```

### Method 2: Manual Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Katzo-de/discord-giveaway.git
    cd discord-giveaway
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    npm ci
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    DISCORD_TOKEN=your_discord_bot_token
    
    # Database Configuration
    # Supported types: mysql, postgres, sqlite
    DB_TYPE=mysql
    
    # For MySQL / PostgreSQL
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=discord_giveaway

    # For SQLite
    # DB_FILENAME=giveaways.sqlite
    ```

4.  **Build and Start:**
    ```bash
    npm run build
    npm start
    ```

## Development

Run the bot in development mode with hot-reloading:

```bash
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
