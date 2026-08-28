from Crypto.Cipher import AES
import hashlib

# Test fixture data for ECDAT scanner
key = b"0123456789abcdef0123456789abcdef"
payload = b"ECDAT cryptographic test payload"

# AES-256-GCM encryption
cipher = AES.new(key, AES.MODE_GCM)

ciphertext, tag = cipher.encrypt_and_digest(payload)

# Hash examples
checksum = hashlib.sha256(payload).hexdigest()
legacy = hashlib.sha1(payload).hexdigest()