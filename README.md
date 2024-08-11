# EE-Tool-Belt

![License](https://img.shields.io/github/license/modom-ofn/ee-tool-belt) ![Version](https://img.shields.io/badge/version-1.0.0-blue)

## Table of Contents

- [EE-Tool-Belt](#ee-tool-belt)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Running the Application](#running-the-application)
    - [Using Node.js](#using-nodejs)
    - [Using Docker](#using-docker)
  - [Configuration](#configuration)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)
  - [Acknowledgements](#acknowledgements)

## Introduction

**EE-Tool-Belt** is a network troubleshooting tool for containerized environments. This project aims to make it easy to deploy simple network tools and is built using Node.js.

## Features

- ./testconnectivity - (endpoint)
  - Example IP Address Usage: "http://localhost:4321/testconnectivity?endpoint=http://1.2.3.4"
  - Example FQDN Usage: "http://localhost:4321/testconnectivity?endpoint=https://www.google.com"
  - Example FQDN with a File Endpoint Usage: "http://localhost:4321/testconnectivity?endpoint=https://www.google.com/todos/1"
- ./latencyrun - (endpoint, times)
  - Example IP Address Usage: "http://localhost:4321/latencyrun?endpoint=http://1.2.3.4&times=10"
  - Example FQDN Usage: "http://localhost:4321/latencyrun?endpoint=https://www.google.com&times=10"
- ./fetchheaders - (url)
  - Example Usage: "http://localhost:4321/fetchHeaders?url=https://www.google.com"
- ./fetchSSLCert - (url)
  - Example Usage: "http://localhost:4321/fetchSSLCert?url=https://www.google.com"
- ./dnslookup - (domain)
  - Example Usage: "http://localhost:4321/dnslookup?domain=www.google.com"
- ./reverse-dns - (ip)
  - Example Usage: "http://localhost:4321/reverse-dns?ip=8.8.8.8"
- ./rate-limit-test - (url, count)
  - Example Usage: "http://localhost:4321/rate-limit-test?url=https://www.google.com/data&count=100"


## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 14.21.3)
- [npm](https://www.npmjs.com/) (version 1.2.8000 || >= 1.4.16)
- [Docker](https://www.docker.com/) (optional, for containerization)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/modom-ofn/ee-tool-belt.git
   ```

2. Navigate to the project directory:

   ```bash
   cd ee-tool-belt
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```
   
## Running the Application

### Using Node.js

To run the application using Node.js:

1. Start the application:

   ```bash
   npm start
   ```
   
2. The application should be running on http://localhost:4321.

### Using Docker

To run the application using Docker:

1. Build the Docker image:

   ```bash
   docker build -t ee-tool-belt .
   ```
   
2. Run the Docker container:

   ```bash
   docker run -p 4321:4321 ee-tool-belt
   ```
   
3. The application should be accessible at http://localhost:4321.

### Configuration

The application can be configured using environment variables. Below is a list of the available configurations:

- PORT: The port on which the application will run (default: 4321).
- NODE_ENV: The environment in which the application is running (development, production, etc.).

You can set these variables in a .env file at the root of your project:

   ```plaintext
   PORT=4321
   NODE_ENV=development
   ```
   
### Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

### License
This code is released under the GNU General Public LIcnse v3. Please see the LICENSE file for more detailed information regarding the license.

### Contact
Mike Odom - @modom-ofn

Project Link: https://github.com/modom-ofn/ee-tool-belt

### Acknowledgements
- NodeJS: https://nodejs.org
- GitHub: https://github.com
- Docker: https://docker.com/
- Baradun and the Dickheads