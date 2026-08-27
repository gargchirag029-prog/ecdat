from cryptography.hazmat.primitives.asymmetric import ec

shared_key = private_key.exchange(ec.ECDH(), peer_public_key)  # key exchange
