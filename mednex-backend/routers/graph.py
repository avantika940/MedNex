"""
Graph Router - Generate knowledge graphs for symptom-disease relationships
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import logging
try:
    from services.graph_builder import GraphBuilderService
except ImportError:
    GraphBuilderService = None

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize graph builder
graph_builder = GraphBuilderService() if GraphBuilderService else None

class GraphRequest(BaseModel):
    symptoms: List[str]
    diseases: List[str]

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # 'symptom', 'disease', 'treatment'
    size: int
    color: str

class GraphEdge(BaseModel):
    source: str
    target: str
    weight: float
    type: str

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: Dict[str, Any]

@router.post("/graph", response_model=GraphResponse)
async def generate_knowledge_graph(request: GraphRequest):
    """
    Generate interactive knowledge graph for symptoms and diseases
    
    Args:
        request: GraphRequest containing symptoms and diseases
        
    Returns:
        GraphResponse with nodes, edges, and graph statistics
    """
    try:
        if not request.symptoms and not request.diseases:
            raise HTTPException(
                status_code=400,
                detail="At least one symptom or disease is required"
            )
        
        # Generate graph
        if graph_builder:
            graph_data = await graph_builder.build_graph(
                symptoms=request.symptoms,
                diseases=request.diseases
            )
        else:
            # Simple fallback graph
            nodes = []
            edges = []
            
            # Add symptom nodes
            for i, symptom in enumerate(request.symptoms):
                nodes.append({
                    "id": f"symptom_{i}",
                    "label": symptom.title(),
                    "type": "symptom",
                    "color": "#3B82F6",
                    "size": 20
                })
            
            # Add disease nodes
            for i, disease in enumerate(request.diseases):
                nodes.append({
                    "id": f"disease_{i}",
                    "label": disease.title(),
                    "type": "disease", 
                    "color": "#EF4444",
                    "size": 30
                })
            
            # Connect symptoms to diseases
            for i in range(len(request.symptoms)):
                for j in range(len(request.diseases)):
                    edges.append({
                        "source": f"symptom_{i}",
                        "target": f"disease_{j}",
                        "weight": 0.5,
                        "type": "indicates"
                    })
            
            graph_data = {
                "nodes": nodes,
                "edges": edges,
                "stats": {
                    "total_nodes": len(nodes),
                    "total_edges": len(edges),
                    "symptom_nodes": len(request.symptoms),
                    "disease_nodes": len(request.diseases),
                    "treatment_nodes": 0,
                    "avg_degree": 2.0,
                    "density": 0.5,
                    "connected_components": 1
                }
            }
        
        return GraphResponse(
            nodes=[
                GraphNode(
                    id=node["id"],
                    label=node["label"],
                    type=node["type"],
                    size=node["size"],
                    color=node["color"]
                )
                for node in graph_data["nodes"]
            ],
            edges=[
                GraphEdge(
                    source=edge["source"],
                    target=edge["target"],
                    weight=edge["weight"],
                    type=edge["type"]
                )
                for edge in graph_data["edges"]
            ],
            stats=graph_data["stats"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating graph: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate knowledge graph. Please try again."
        )
