from Crypto.Cipher import AES
import hashlib

cipher = AES.new(key, AES.MODE_GCM)  # AES-256 encryption
checksum = hashlib.sha256(payload).hexdigest()
legacy = hashlib.sha1(payload).hexdigest()
