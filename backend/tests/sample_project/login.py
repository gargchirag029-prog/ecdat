from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes

# Test payload
payload = b"ECDAT login authentication message"

# Generate ECDSA private key
private_key = ec.generate_private_key(ec.SECP256R1())

# ECDSA signature
signature = private_key.sign(
    payload,
    ec.ECDSA(hashes.SHA256())
)

# Public key for verification
public_key = private_key.public_key()

public_key.verify(
    signature,
    payload,
    ec.ECDSA(hashes.SHA256())
)