"""
Initialize routers package
"""

from . import symptoms
from . import prediction
from . import graph
from . import explanation
from . import chat
from . import auth
from . import admin
from . import customer

__all__ = [
    'symptoms',
    'prediction',
    'graph',
    'explanation',
    'chat',
    'auth',
    'admin',
    'customer'
]
