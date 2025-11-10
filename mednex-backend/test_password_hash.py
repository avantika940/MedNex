"""Test password hashing and verification"""
import sys
sys.path.insert(0, 'e:\\Avi Full stack\\mednex-backend')

from passlib.context import CryptContext

# Test password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

test_password = "Test123!"
print(f"Testing password: {test_password}")

# Hash the password
hashed = pwd_context.hash(test_password)
print(f"Hashed password: {hashed}")
print(f"Hash length: {len(hashed)}")

# Verify the password immediately
verify_result = pwd_context.verify(test_password, hashed)
print(f"Immediate verification: {verify_result}")

# Test with wrong password
wrong_result = pwd_context.verify("WrongPass", hashed)
print(f"Wrong password verification: {wrong_result}")

# Test with bcrypt directly
import bcrypt

# Hash with bcrypt directly
bcrypt_hashed = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
print(f"\nBcrypt direct hash: {bcrypt_hashed}")

# Verify with bcrypt
bcrypt_verify = bcrypt.checkpw(test_password.encode('utf-8'), bcrypt_hashed)
print(f"Bcrypt direct verification: {bcrypt_verify}")
