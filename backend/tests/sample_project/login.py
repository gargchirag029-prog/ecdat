from cryptography.hazmat.primitives.asymmetric import rsa, ec

rsa_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
ecdsa_key = ec.generate_private_key(ec.SECP256R1())
signature = ecdsa_key.sign(payload, ec.ECDSA(hashes.SHA256()))
