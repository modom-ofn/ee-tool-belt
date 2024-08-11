/**
 * @fileoverview
 * This app provides simple network troubleshooting tools for 
 * containerized environments.
 * 
 * @author Mike Odom
 * @copyright 2024 Mike Odom
 * @license 
 * This code is released under the GNU General Public License v3.
 * Reference LICENSE.md for details of any restrictions or conditions.
 *
 * See the full license here: https://creativecommons.org/publicdomain/zero/1.0/
 */
const express = require('express');
const axios = require('axios');
const app = express();
const tls = require('tls');
const dns = require('dns');
const PORT = process.env.PORT || 4321;

// App List 
// ./testconnectivity - (endpoint)
// ./latencyrun - (endpoint, times)
// ./fetchheaders - (url)
// ./fetchSSLCert - (url)
// ./dnslookup - (domain)
// ./reverse-dns - (ip)
// ./rate-limit-test - (url, count)

app.get('/', (req, res) => {
    res.send('Hello, World! The ee-tool-belt app is online.');
});


app.get('/testconnectivity', async (req, res) => {
    // Example IP Address Usage: "http://localhost:4321/testconnectivity?endpoint=http://1.2.3.4"
	// Example FQDN Usage: "http://localhost:4321/testconnectivity?endpoint=https://www.google.com"
	// Example FQDN with a File Endpoint Usage: "http://localhost:4321/testconnectivity?endpoint=https://www.google.com/todos/1"

	const fullEndpoint = req.query.endpoint;

    // Basic validation to check if the URL is provided
    if (!fullEndpoint) {
        return res.status(400).send('Please provide a valid URL as a "url" query parameter.');
    }

    try {
        const response = await axios.get(fullEndpoint);

        if (typeof response.data === 'object') {
            // Assuming we fetched a JSON, send it as application/json
            res.json(response.data);
        } else {
            // For other content types, send as plain text
            res.send(response.data);
        }
    } catch (error) {
        let errorMessage = `Failed to connect to ${fullEndpoint}.`;
        
        // Extract detailed information if present
        if (error.response) {
        errorMessage += ` Response Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data, null, 2)}.`;
    } else if (error.request) {
        // For simplicity, just include the method and the URL, avoiding the circular structure
        errorMessage += ` No response received. Request Method: ${error.request.method}. URL: ${error.request.url}.`;
    } else {
        errorMessage += ` Message: ${error.message}.`;
    }

        // Add stack trace for detailed diagnosis
        errorMessage += ` Stack: ${error.stack}.`;

        res.status(400).send(errorMessage);
    }
});

app.get('/latencyrun', async (req, res) => {
	// Example IP Address Usage: "http://localhost:4321/latencyrun?endpoint=http://1.2.3.4&times=10"
	// Example FQDN Usage: "http://localhost:4321/latencyrun?endpoint=https://www.google.com&times=10"
	
	const endpoint = req.query.endpoint;
    const times = parseInt(req.query.times);

    if (!endpoint) {
        return res.status(400).send({ error: 'Please provide a valid URL as a "url" query parameter.' });
    }

    if (!times || isNaN(times)) {
        return res.status(400).send({ error: 'Please provide a valid times query parameter.' });
    }

    let totalLatency = 0;

    for (let i = 0; i < times; i++) {
        const startTimestamp = Date.now();
        try {
            await axios.get(endpoint);
            totalLatency += Date.now() - startTimestamp;
        } catch (error) {
            let errorMessage = `Failed to connect to ${endpoint} on attempt ${i + 1}.`;
            
            if (error.response) {
                errorMessage += ` Response Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data, null, 2)}.`;
            } else if (error.request) {
                // For simplicity, just include the method and the URL, avoiding the circular structure
                errorMessage += ` No response received. Request Method: ${error.request.method}. URL: ${error.request.url}.`;
            } else {
                errorMessage += ` Message: ${error.message}.`;
            }

            // Add stack trace for detailed diagnosis
            errorMessage += ` Stack: ${error.stack}.`;

            return res.status(500).send({
                status: 'error',
                message: errorMessage,
            });
        }
    }

    const averageLatency = totalLatency / times;

    return res.send({
        status: 'success',
        endpointTested: endpoint,
        timesRequested: times,
        totalLatency: `${totalLatency} ms`,
        averageLatency: `${averageLatency} ms`,
    });
});

app.get('/fetchHeaders', async (req, res) => {
	// Example Usage: "http://localhost:4321/fetchHeaders?url=https://www.google.com"

    const targetURL = req.query.url;

    // Basic validation to check if the URL is provided
    if (!targetURL) {
        return res.status(400).send('Please provide a valid URL as a "url" query parameter.');
    }

    try {
        const response = await axios.get(targetURL, {
            validateStatus: null, // We want to fetch headers even if the response status is an error
            timeout: 5000,  // Setting a reasonable timeout
        });

        return res.json({
            requestHeaders: response.config.headers,
            responseHeaders: response.headers
        });
    } catch (error) {
        return res.status(500).send({
            error: `Failed to fetch headers for ${targetURL}. Error: ${error.message}`
        });
    }
});

app.get('/fetchSSLCert', (req, res) => {
    // Example Usage: "http://localhost:4321/fetchSSLCert?url=https://www.google.com"
	
	const targetURL = req.query.url;

    if (!targetURL) {
        return res.status(400).send({ error: 'Please provide a valid URL as a "url" query parameter.' });
    }

    try {
        const { hostname, port } = new URL(targetURL);
        const validPort = port || 443;

        if (isNaN(validPort) || validPort <= 0 || validPort >= 65536) {
            return res.status(400).send({ error: 'Invalid port number.' });
        }

        const socket = tls.connect({
            host: hostname,
            port: validPort,
            ciphers: 'ALL',
            secureProtocol: 'TLSv1_2_method',  // You can change this to TLSv1_3_method if the server supports TLS 1.3
        }, () => {
            if (socket.authorized) {
                const certificate = socket.getPeerCertificate();
                res.json({
                    valid_from: certificate.valid_from,
                    valid_to: certificate.valid_to,
                    issuer: certificate.issuer,
                    subject: certificate.subject,
                    expired: certificate.valid_to ? new Date(certificate.valid_to) < new Date() : true
                });
            } else {
                res.status(400).send({ error: 'Certificate verification failed.', reason: socket.authorizationError });
            }
            socket.end();
        });

        socket.on('error', (error) => {
            res.status(500).send({ error: `Error fetching SSL certificate. Reason: ${error.message}` });
        });

    } catch (error) {
        res.status(500).send({ error: `Failed to fetch SSL details. Reason: ${error.message}` });
    }
});

app.get('/dnslookup', (req, res) => {
	// Example Usage: "http://localhost:4321/dnslookup?domain=www.google.com"
	
    const domain = req.query.domain;

    if (!domain) {
        return res.status(400).send({ error: 'A valid domain query parameter is required.' });
    }

    dns.lookup(domain, (error, address, family) => {
        if (error) {
            return res.status(500).send({ error: `DNS lookup failed. Reason: ${error.message}` });
        }

        res.json({
            domain: domain,
            address: address,
            family: `IPv${family}`
        });
    });
});

app.get('/reverse-dns', (req, res) => {
	// Example Usage: "http://localhost:4321/reverse-dns?ip=8.8.8.8"
	
    const ip = req.query.ip;

    if (!ip) {
        return res.status(400).send({ error: 'IP address is required as a query parameter.' });
    }

    dns.reverse(ip, (error, hostnames) => {
        if (error) {
            return res.status(500).send({ error: `Error performing reverse DNS lookup for IP ${ip}. Reason: ${error.message}` });
        }
        res.send({
            ip: ip,
            hostnames: hostnames
        });
    });
});

app.get('/rate-limit-test', async (req, res) => {
	// Example Usage: "http://localhost:4321/rate-limit-test?url=https://www.google.com/data&count=100"
	
    const targetUrl = req.query.url;
    const requestCount = parseInt(req.query.count) || 5;  // Default to 5 requests

    if (!targetUrl) {
        return res.status(400).send({ error: 'Target URL is required as a query parameter.' });
    }

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

    res.send({
        targetUrl: targetUrl,
        totalRequests: requestCount,
        successfulRequests: successfulRequests,
        rateLimitedRequests: rateLimitedRequests,
        failedRequests: failedRequests
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
