from cryptography.hazmat.primitives.asymmetric import ec

# Generate local ECDH private key
private_key = ec.generate_private_key(ec.SECP256R1())

# Generate peer key pair
peer_private_key = ec.generate_private_key(ec.SECP256R1())
peer_public_key = peer_private_key.public_key()

# ECDH key agreement
shared_key = private_key.exchange(
    ec.ECDH(),
    peer_public_key
)