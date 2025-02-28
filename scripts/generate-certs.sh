#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default environment
ENV=${1:-staging}
DOMAIN=${2:-localhost}

# Target directory
CERT_DIR="nginx/ssl"

# Print banner
echo -e "${GREEN}"
echo "================================================="
echo "   SSL Certificate Generator"
echo "   Environment: ${ENV}"
echo "   Domain: ${DOMAIN}"
echo "================================================="
echo -e "${NC}"

# Create certificates directory
mkdir -p "${CERT_DIR}"

# Generate a private key
echo -e "${GREEN}Generating private key...${NC}"
openssl genrsa -out "${CERT_DIR}/${ENV}.key" 2048

# Generate a CSR (Certificate Signing Request)
echo -e "${GREEN}Generating CSR...${NC}"
cat > "${CERT_DIR}/${ENV}.cnf" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C=US
ST=State
L=City
O=Organization
OU=Department
CN=${DOMAIN}

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${DOMAIN}
DNS.2 = *.${DOMAIN}
DNS.3 = localhost
EOF

openssl req -new -key "${CERT_DIR}/${ENV}.key" -out "${CERT_DIR}/${ENV}.csr" -config "${CERT_DIR}/${ENV}.cnf"

# Generate a self-signed certificate
echo -e "${GREEN}Generating self-signed certificate...${NC}"
openssl x509 -req -days 365 -in "${CERT_DIR}/${ENV}.csr" -signkey "${CERT_DIR}/${ENV}.key" -out "${CERT_DIR}/${ENV}.crt" \
    -extensions req_ext -extfile "${CERT_DIR}/${ENV}.cnf"

# Create symbolic links for default names
echo -e "${GREEN}Creating symbolic links...${NC}"
ln -sf "${ENV}.key" "${CERT_DIR}/server.key"
ln -sf "${ENV}.crt" "${CERT_DIR}/server.crt"

# Set proper permissions
echo -e "${GREEN}Setting permissions...${NC}"
chmod 600 "${CERT_DIR}/${ENV}.key"
chmod 644 "${CERT_DIR}/${ENV}.crt"
chmod 644 "${CERT_DIR}/${ENV}.csr"
chmod 644 "${CERT_DIR}/${ENV}.cnf"

echo -e "${GREEN}Certificate generation complete!${NC}"
echo "Key: ${CERT_DIR}/${ENV}.key"
echo "Certificate: ${CERT_DIR}/${ENV}.crt"
echo
echo -e "${YELLOW}Note: This is a self-signed certificate and will trigger browser warnings.${NC}"
echo -e "${YELLOW}For production use, obtain a certificate from a trusted Certificate Authority.${NC}" 