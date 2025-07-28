#!/bin/bash

# Full VPN server setup script for YouCantSeeMeVPN
# Installs OpenVPN, initializes PKI, interacts with the Hostinger
# CA worker API for certificate signing, configures the server,
# and generates a client profile.
# Run this script as root.

set -e

# 1. Update and upgrade packages
apt update && apt upgrade -y

# 2. Install dependencies
apt install -y openvpn easy-rsa curl ufw iptables-persistent

# 3. Initialize PKI and build CA
EASYRSA_DIR=/etc/openvpn/easy-rsa
make-cadir "$EASYRSA_DIR"
cd "$EASYRSA_DIR"
./easyrsa init-pki
./easyrsa build-ca nopass

# 4. Generate server certificate request
./easyrsa gen-req server nopass
CSR_PATH="$EASYRSA_DIR/pki/reqs/server.req"
API_URL="https://example.hostinger.workers.dev/sign"
API_TOKEN="REPLACE_WITH_TOKEN"

# Send CSR to Hostinger CA worker and retrieve signed certificate
curl -f -X POST "$API_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  --data-binary "@$CSR_PATH" -o /etc/openvpn/server.crt

cp "$EASYRSA_DIR/pki/private/server.key" /etc/openvpn/
cp "$EASYRSA_DIR/pki/ca.crt" /etc/openvpn/

# 5. Generate Diffie-Hellman parameters and TLS key
./easyrsa gen-dh
cp "$EASYRSA_DIR/pki/dh.pem" /etc/openvpn/dh.pem
openvpn --genkey --secret /etc/openvpn/ta.key

# 6. Create secure server configuration
cat > /etc/openvpn/server.conf <<'CONF'
port 1194
proto udp
dev tun
ca ca.crt
cert server.crt
key server.key
dh dh.pem
tls-auth ta.key 0
topology subnet
server 10.8.0.0 255.255.255.0
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 1.1.1.1"
push "dhcp-option DNS 8.8.8.8"
keepalive 10 120
cipher AES-256-GCM
user nobody
group nogroup
persist-key
persist-tun
verb 3
CONF

# 7. Enable IP forwarding
sed -i 's/^#?net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf
sysctl -p

# 8. Configure firewall rules
ufw allow 1194/udp
ufw allow OpenSSH
ufw --force enable
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
netfilter-persistent save

# 9. Enable and start OpenVPN
systemctl enable openvpn@server
systemctl start openvpn@server

# 10. Create client certificate and sign
./easyrsa gen-req client nopass
CLIENT_CSR="$EASYRSA_DIR/pki/reqs/client.req"
CLIENT_CERT="$EASYRSA_DIR/pki/issued/client.crt"

curl -f -X POST "$API_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  --data-binary "@$CLIENT_CSR" -o "$CLIENT_CERT"

cp "$EASYRSA_DIR/pki/private/client.key" /etc/openvpn/client.key
cp "$CLIENT_CERT" /etc/openvpn/client.crt

# 11. Build client profile
CLIENT_OVPN=~/client.ovpn
cat > "$CLIENT_OVPN" <<EOF2
client
dev tun
proto udp
remote YOUR_SERVER_IP 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
key-direction 1
<ca>
$(cat /etc/openvpn/ca.crt)
</ca>
<cert>
$(cat /etc/openvpn/client.crt)
</cert>
<key>
$(cat /etc/openvpn/client.key)
</key>
<tls-auth>
$(cat /etc/openvpn/ta.key)
</tls-auth>
EOF2

# 12. Optional: upload client profile to Firebase
if command -v firebase >/dev/null; then
  firebase deploy --only hosting
fi

echo "OpenVPN setup complete. Client profile saved to $CLIENT_OVPN"

