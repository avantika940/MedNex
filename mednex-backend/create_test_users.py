"""
Quick script to create test admin and customer users
"""
import sys
import asyncio
sys.path.insert(0, 'e:\\Avi Full stack\\mednex-backend')

from database.mongodb_client import MongoDBClient
from utils.auth import get_password_hash

async def create_test_users():
    """Create test users"""
    db = MongoDBClient()
    
    print("Creating test users in MongoDB\n")
    
    # Create admin user
    print("=" * 60)
    print("Creating Admin User")
    print("=" * 60)
    admin_password = "Admin123!"
    admin_user = await db.create_user(
        email="admin@mednex.com",
        full_name="Admin User",
        hashed_password=get_password_hash(admin_password),
        role="admin"
    )
    
    if admin_user:
        print(f"✓ Admin created successfully!")
        print(f"  Email: admin@mednex.com")
        print(f"  Password: {admin_password}")
        print(f"  Role: admin")
    
    # Create customer user
    print("\n" + "=" * 60)
    print("Creating Customer User")
    print("=" * 60)
    customer_password = "Customer123!"
    customer_user = await db.create_user(
        email="customer@mednex.com",
        full_name="Customer User",
        hashed_password=get_password_hash(customer_password),
        role="customer"
    )
    
    if customer_user:
        print(f"✓ Customer created successfully!")
        print(f"  Email: customer@mednex.com")
        print(f"  Password: {customer_password}")
        print(f"  Role: customer")
    
    print("\n" + "=" * 60)
    print("LOGIN URLS")
    print("=" * 60)
    print(f"Admin Login:    http://localhost:3000/admin/login")
    print(f"Customer Login: http://localhost:3000/login")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(create_test_users())
