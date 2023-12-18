//////////////////////////////////////////
// Required NPM Modules
//////////////////////////////////////////
const readline = require('readline');
const axios = require('axios');
const dns = require('dns');
const tls = require('tls');
const URL = require('url').URL;
//////////////////////////////////////////
// Build Terminal Interface 
// (Requires Readline NPM module)
//////////////////////////////////////////
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});
//////////////////////////////////////////
// Build Rate Limit Test Functionality 
//////////////////////////////////////////
async function rateLimitTest(targetUrl, requestCount) {
  let successfulRequests = 0;
  let failedRequests = 0;
  let rateLimitedRequests = 0;

  for (let i = 0; i < requestCount; i++) {
    try {
      await axios.get(targetUrl);
      successfulRequests++;
    } catch (error) {
      if (error.response && (error.response.status === 429 || error.response.statusText.includes('Too Many Requests'))) {
        rateLimitedRequests++;
      } else {
        failedRequests++;
      }
    }
  }

  console.log({
    targetUrl: targetUrl,
    totalRequests: requestCount,
    successfulRequests: successfulRequests,
    rateLimitedRequests: rateLimitedRequests,
    failedRequests: failedRequests
  });
}
//////////////////////////////////////////
// Build Reverse DNS Lookup Functionality 
// (Requires DNS NPM module)
//////////////////////////////////////////
function reverseDNSLookup(ip) {
  dns.reverse(ip, (error, hostnames) => {
    if (error) {
      console.log(`Error performing reverse DNS lookup for IP ${ip}. Reason: ${error.message}`);
      return;
    }
    console.log({
      ip: ip,
      hostnames: hostnames
    });
  });
}
//////////////////////////////////////////
// Build DNS Lookup Functionality 
// (Requires DNS NPM module)
//////////////////////////////////////////
function dnsLookup(domain) {
  dns.lookup(domain, (error, address, family) => {
    if (error) {
      console.log(`DNS lookup failed. Reason: ${error.message}`);
      return;
    }
    console.log({
      domain: domain,
      address: address,
      family: `IPv${family}`
    });
  });
}
//////////////////////////////////////////
// Build Fetch SSL Cert Functionality 
// (Requires TLS & URL NPM modules)
//////////////////////////////////////////
async function fetchSSLCert(targetURL) {
  try {
    const { hostname, port } = new URL(targetURL);
    const validPort = port || 443;

    if (isNaN(validPort) || validPort <= 0 || validPort >= 65536) {
      console.log('Invalid port number.');
      return;
    }

    const socket = tls.connect({
      host: hostname,
      port: validPort,
      ciphers: 'ALL',
      secureProtocol: 'TLSv1_2_method',  // You can change this to TLSv1_3_method if the server supports TLS 1.3
    }, () => {
      if (socket.authorized) {
        const certificate = socket.getPeerCertificate();
        console.log({
          valid_from: certificate.valid_from,
          valid_to: certificate.valid_to,
          issuer: certificate.issuer,
          subject: certificate.subject,
          expired: certificate.valid_to ? new Date(certificate.valid_to) < new Date() : true
        });
      } else {
        console.log(`Certificate verification failed. Reason: ${socket.authorizationError}`);
      }
      socket.end();
    });

    socket.on('error', (error) => {
      console.log(`Error fetching SSL certificate. Reason: ${error.message}`);
    });

  } catch (error) {
    console.log(`Failed to fetch SSL details. Reason: ${error.message}`);
  }
}
//////////////////////////////////////////
// Build Latency Test Functionality
// (Requires Axios NPM module)
//////////////////////////////////////////
async function runLatencyTest(endpoint, times) {
  let totalLatency = 0;

  for (let i = 0; i < times; i++) {
    const startTimestamp = Date.now();
    try {
      await axios.get(endpoint);
      totalLatency += Date.now() - startTimestamp;
    } catch (error) {
      console.error(`Failed to connect to ${endpoint} on attempt ${i + 1}.`);
      return;
    }
  }

  const averageLatency = totalLatency / times;
  console.log({
    endpointTested: endpoint,
    timesRequested: times,
    totalLatency: `${totalLatency} ms`,
    averageLatency: `${averageLatency} ms`,
  });
}
//////////////////////////////////////////
// Build Fetch Headers Functionality
// (Requires Axios NPM module)
//////////////////////////////////////////
async function fetchHeaders(targetURL) {
  try {
    const response = await axios.get(targetURL, {
      validateStatus: null,
      timeout: 5000,
    });

    console.log({
      requestHeaders: response.config.headers,
      responseHeaders: response.headers,
    });
  } catch (error) {
    console.error(`Failed to fetch headers for ${targetURL}. Error: ${error.message}`);
  }
}
//////////////////////////////////////////
// Build Test Connectivity Functionality
// (Requires Axios NPM module)
//////////////////////////////////////////
async function testConnectivity(fullEndpoint) {
  try {
    const response = await axios.get(fullEndpoint);

    if (typeof response.data === 'object') {
      console.log("Received JSON data:", JSON.stringify(response.data, null, 2));
    } else {
      console.log("Received data:", response.data);
    }
  } catch (error) {
    let errorMessage = `Failed to connect to ${fullEndpoint}.`;

    if (error.response) {
      errorMessage += ` Response Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data, null, 2)}.`;
    } else if (error.request) {
      errorMessage += ` No response received. Request Method: ${error.request.method}. URL: ${error.request.url}.`;
    } else {
      errorMessage += ` Message: ${error.message}.`;
    }

    errorMessage += ` Stack: ${error.stack}.`;
    console.error(errorMessage);
  }
}
//////////////////////////////////////////
// Define Each Command Below
//////////////////////////////////////////
const commands = {
//////////////////////////////////////////
// Latency Test Command
//////////////////////////////////////////
  'latencytest': {
    description: 'Runs a latency test against an endpoint',
    execute: (args) => {
      if (args.length < 2) {
        console.log('Missing arguments. Use "latencytest --help" for usage.');
        return;
      }
      runLatencyTest(args[0], parseInt(args[1]));
    },
    help: () => {
      console.log('Usage: latencytest [endpoint] [times]');
      console.log('Performs a latency test against the given endpoint for a specified number of times.');
    },
  },
//////////////////////////////////////////
// Rate Limit Command
//////////////////////////////////////////
  'ratelimit': {
    description: 'Tests rate limiting against a target URL with a certain number of requests.',
    execute: async (args) => {
      if (args.length < 2) {
        console.log('Missing arguments. Use "ratelimit --help" for usage.');
        return;
      }
      const targetUrl = args[0];
      const requestCount = parseInt(args[1]);
      if (isNaN(requestCount)) {
        console.log('Invalid count. It should be a number.');
        return;
      }
      await rateLimitTest(targetUrl, requestCount);
    },
    help: () => {
      console.log('Usage: ratelimit [Target URL] [Request Count]');
      console.log('Tests rate limiting against the target URL by sending [Request Count] number of requests.');
    },
  },
//////////////////////////////////////////
// Reverse DNS Command
//////////////////////////////////////////
  'reversedns': {
    description: 'Performs a reverse DNS lookup for a given IP address',
    execute: (args) => {
      if (args.length < 1) {
        console.log('Missing IP argument. Use "reversedns --help" for usage.');
        return;
      }
      reverseDNSLookup(args[0]);
    },
    help: () => {
      console.log('Usage: reversedns [IP]');
      console.log('Performs a reverse DNS lookup for the given IP address.');
    },
  },
//////////////////////////////////////////
// DNS Lookup Command
//////////////////////////////////////////
  'dnslookup': {
    description: 'Performs a DNS lookup for a given domain',
    execute: (args) => {
      if (args.length < 1) {
        console.log('Missing domain argument. Use "dnslookup --help" for usage.');
        return;
      }
      dnsLookup(args[0]);
    },
    help: () => {
      console.log('Usage: dnslookup [domain]');
      console.log('Performs a DNS lookup for the given domain.');
    },
  },
//////////////////////////////////////////
// Fetch SSL Cert Command
//////////////////////////////////////////
  'fetchsslcert': {
    description: 'Fetches SSL certificate information for a given URL',
    execute: (args) => {
      if (args.length < 1) {
        console.log('Missing URL argument. Use "fetchsslcert --help" for usage.');
        return;
      }
      fetchSSLCert(args[0]);
    },
    help: () => {
      console.log('Usage: fetchsslcert [url]');
      console.log('Fetches SSL certificate information for the given URL.');
    },
  },
//////////////////////////////////////////
// Test Connectivity Command
//////////////////////////////////////////
  'testconnectivity': {
    description: 'Tests connectivity to a given endpoint',
    execute: (args) => {
      console.log('Received args:', args);  // Debug log to check what's in args
  
      // Check if args is undefined before checking its length
      if (!args || args.length < 1) {
        console.log('Missing endpoint argument. Use "testconnectivity --help" for usage.');
        return;
      }
  
      testConnectivity(args[0]);
    },
    help: () => {
      console.log('Usage: testconnectivity [endpoint]');
      console.log('Tests connectivity to the given endpoint and displays the received data.');
    },
  },
//////////////////////////////////////////
// Fetch Headers Command
//////////////////////////////////////////
  'fetchHeaders': {
    description: 'Fetches request and response headers for a given URL',
    execute: (args) => {
      if (args.length < 1) {
        console.log('Missing URL argument. Use "fetchHeaders --help" for usage.');
        return;
      }
      fetchHeaders(args[0]);
    },
    help: () => {
      console.log('Usage: fetchHeaders [url]');
      console.log('Fetches request and response headers for the given URL.');
    },
  },
};
//////////////////////////////////////////
// Build Help Functionality
//////////////////////////////////////////
function displayHelp() {
  console.log('Available commands:');
  for (const [command, info] of Object.entries(commands)) {
    console.log(`${command} - ${info.description}`);
  }
  console.log('Type "--help" after any command to get more details.');
}

rl.prompt();

//////////////////////////////////////////
// Build Execute Command Functionality
//////////////////////////////////////////
rl.on('line', (line) => {
  const [command, ...args] = line.trim().split(' ');

  if (command === '--help') {
    displayHelp();
  } else if (commands[command]) {
    if (args[0] === '--help') {
      commands[command].help();
    } else {
      commands[command].execute();
    }
  } else {
    console.log('Invalid command, type "--help" to see available commands');
  }

  rl.prompt();
});
