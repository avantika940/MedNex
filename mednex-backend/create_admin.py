"""
Script to create an admin user in the database
Run this once to create your first admin account
"""
import sys
import asyncio
sys.path.insert(0, 'e:\\Avi Full stack\\mednex-backend')

from database.mongodb_client import MongoDBClient
from utils.auth import get_password_hash

async def create_admin_user():
    """Create an admin user"""
    db = MongoDBClient()
    
    # Admin credentials
    admin_email = "admin@mednex.com"
    admin_password = "Admin123!"  # Change this to a secure password
    admin_name = "Admin User"
    
    print(f"Creating admin user: {admin_email}")
    
    # Check if admin already exists
    existing_admin = await db.get_user_by_email(admin_email)
    if existing_admin:
        print(f"✓ Admin user already exists with ID: {existing_admin['id']}")
        print(f"  Email: {existing_admin['email']}")
        print(f"  Role: {existing_admin['role']}")
        return existing_admin
    
    # Create admin user
    hashed_password = get_password_hash(admin_password)
    admin_user = await db.create_user(
        email=admin_email,
        full_name=admin_name,
        hashed_password=hashed_password,
        role="admin"
    )
    
    if admin_user:
        print(f"✓ Admin user created successfully!")
        print(f"  Email: {admin_email}")
        print(f"  Password: {admin_password}")
        print(f"  Role: admin")
        print(f"\n⚠️  IMPORTANT: Change the password after first login!")
    else:
        print("✗ Failed to create admin user")
    
    return admin_user

if __name__ == "__main__":
    print("=" * 60)
    print("MedNex Admin User Creation Script")
    print("=" * 60)
    print()
    
    admin = asyncio.run(create_admin_user())
    
    print()
    print("=" * 60)
    print("You can now login to the admin panel at:")
    print("http://localhost:3000/admin/login")
    print("=" * 60)
