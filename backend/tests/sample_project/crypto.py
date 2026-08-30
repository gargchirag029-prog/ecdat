from Crypto.Cipher import AES
from cryptography.hazmat.primitives.asymmetric import rsa
import hashlib

# Test fixture data for ECDAT scanner
key = b"0123456789abcdef0123456789abcdef"
payload = b"ECDAT cryptographic test payload"

# RSA key generation for scanner validation
rsa_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

# AES-256-GCM encryption
cipher = AES.new(key, AES.MODE_GCM)

ciphertext, tag = cipher.encrypt_and_digest(payload)

# Hash examples
checksum = hashlib.sha256(payload).hexdigest()
legacy = hashlib.sha1(payload).hexdigest()