# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Server Setup

Run `./full_setup_vpn.sh` as root to provision a new OpenVPN server. The script installs required packages, initializes the PKI, signs certificates via Hostinger's CA worker, configures `server.conf`, enables IP forwarding and firewall rules, and produces a `client.ovpn` file for client connections.
