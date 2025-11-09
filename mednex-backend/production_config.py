# Production Environment Optimization for Memory-Constrained Deployments
# This file will be imported in production to disable heavy models

import os
import logging

logger = logging.getLogger(__name__)

def is_memory_constrained():
    """Check if we're running in a memory-constrained environment"""
    # Check for Render.com or other production indicators
    return (
        os.getenv("RENDER") == "true" or
        os.getenv("DEBUG", "True").lower() == "false" or
        os.getenv("ENVIRONMENT") == "production"
    )

def optimize_for_production():
    """Apply production optimizations"""
    if is_memory_constrained():
        logger.info("Applying memory optimizations for production deployment")
        
        # Set environment variables for model optimization
        os.environ["TOKENIZERS_PARALLELISM"] = "false"
        os.environ["OMP_NUM_THREADS"] = "1"
        os.environ["MKL_NUM_THREADS"] = "1"
        
        return True
    return False
