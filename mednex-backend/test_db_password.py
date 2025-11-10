"""Debug database password storage and retrieval"""
import sys
import asyncio
sys.path.insert(0, 'e:\\Avi Full stack\\mednex-backend')

from database.mongodb_client import MongoDBClient
from utils.auth import get_password_hash, verify_password

async def test_db_password():
    db = MongoDBClient()
    
    # Test credentials
    test_email = "debug_test@example.com"
    test_password = "TestPass123!"
    
    print(f"Testing with email: {test_email}")
    print(f"Testing with password: {test_password}")
    
    # Hash password
    hashed = get_password_hash(test_password)
    print(f"\nHashed password: {hashed}")
    print(f"Hash length: {len(hashed)}")
    
    # Create test user
    print("\n--- Creating test user ---")
    user = await db.create_user(
        email=test_email,
        full_name="Debug Test User",
        hashed_password=hashed,
        role="customer"
    )
    
    if user:
        print(f"User created with ID: {user.get('id')}")
        print(f"Stored hashed_password: {user.get('hashed_password')}")
        print(f"Stored hash length: {len(user.get('hashed_password', ''))}")
    
    # Retrieve user from database
    print("\n--- Retrieving user from database ---")
    retrieved_user = await db.get_user_by_email(test_email)
    
    if retrieved_user:
        print(f"Retrieved user ID: {retrieved_user.get('id')}")
        db_hash = retrieved_user.get('hashed_password', '')
        print(f"Retrieved hashed_password: {db_hash}")
        print(f"Retrieved hash length: {len(db_hash)}")
        
        # Test verification
        print("\n--- Testing password verification ---")
        print(f"Original hash matches retrieved: {hashed == db_hash}")
        
        verify_result = verify_password(test_password, db_hash)
        print(f"Password verification result: {verify_result}")
        
        # Clean up - delete test user
        print("\n--- Cleaning up ---")
        await db.delete_user(retrieved_user['id'])
        print("Test user deleted")
    else:
        print("ERROR: Could not retrieve user from database!")

if __name__ == "__main__":
    asyncio.run(test_db_password())
