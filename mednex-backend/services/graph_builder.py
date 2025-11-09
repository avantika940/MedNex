"""
Graph Builder Service

This service creates knowledge graphs using NetworkX to visualize relationships
between symptoms, diseases, and treatments for the D3.js frontend visualization.
"""

import networkx as nx
import json
import logging
from typing import List, Dict, Any
from database.supabase_client import SupabaseClient

logger = logging.getLogger(__name__)

class GraphBuilderService:
    """Service for building knowledge graphs"""
    
    def __init__(self):
        """Initialize graph builder service"""
        self.db_client = SupabaseClient()
        self.node_colors = {
            'symptom': '#3B82F6',  # Blue
            'disease': '#EF4444',  # Red
            'treatment': '#10B981' # Green
        }
        self.node_sizes = {
            'symptom': 20,
            'disease': 30,
            'treatment': 25
        }
    
    async def build_graph(self, symptoms: List[str], diseases: List[str]) -> Dict[str, Any]:
        """
        Build knowledge graph from symptoms and diseases
        
        Args:
            symptoms: List of symptoms
            diseases: List of diseases
            
        Returns:
            Dictionary containing nodes, edges, and graph statistics
        """
        try:
            # Create NetworkX graph
            G = nx.Graph()
            
            # Add symptom nodes
            symptom_nodes = []
            for symptom in symptoms:
                node_id = f"symptom_{symptom.lower().replace(' ', '_')}"
                G.add_node(node_id, 
                          label=symptom.title(),
                          type='symptom',
                          color=self.node_colors['symptom'],
                          size=self.node_sizes['symptom'])
                symptom_nodes.append(node_id)
            
            # Add disease nodes
            disease_nodes = []
            for disease in diseases:
                node_id = f"disease_{disease.lower().replace(' ', '_')}"
                G.add_node(node_id,
                          label=disease.title(),
                          type='disease', 
                          color=self.node_colors['disease'],
                          size=self.node_sizes['disease'])
                disease_nodes.append(node_id)
            
            # Add treatment nodes and connect to diseases
            treatment_nodes = []
            treatments = await self._get_treatments_for_diseases(diseases)
            
            for disease_node, treatment_list in treatments.items():
                for treatment in treatment_list:
                    treatment_id = f"treatment_{treatment.lower().replace(' ', '_')}"
                    
                    if treatment_id not in [n for n in G.nodes()]:
                        G.add_node(treatment_id,
                                  label=treatment.title(),
                                  type='treatment',
                                  color=self.node_colors['treatment'], 
                                  size=self.node_sizes['treatment'])
                        treatment_nodes.append(treatment_id)
                    
                    # Connect disease to treatment
                    G.add_edge(disease_node, treatment_id, 
                              weight=0.8, type='treats')
            
            # Connect symptoms to diseases based on relationships
            symptom_disease_connections = await self._get_symptom_disease_relationships(symptoms, diseases)
            
            for symptom_node in symptom_nodes:
                for disease_node in disease_nodes:
                    # Get relationship strength
                    weight = symptom_disease_connections.get(
                        (symptom_node, disease_node), 0
                    )
                    
                    if weight > 0.3:  # Only add edges with reasonable strength
                        G.add_edge(symptom_node, disease_node,
                                  weight=weight, type='indicates')
            
            # Convert to JSON format for D3.js
            nodes = []
            edges = []
            
            for node_id, node_data in G.nodes(data=True):
                nodes.append({
                    'id': node_id,
                    'label': node_data['label'],
                    'type': node_data['type'],
                    'color': node_data['color'],
                    'size': node_data['size']
                })
            
            for source, target, edge_data in G.edges(data=True):
                edges.append({
                    'source': source,
                    'target': target,
                    'weight': edge_data['weight'],
                    'type': edge_data['type']
                })
            
            # Calculate graph statistics
            stats = {
                'total_nodes': len(nodes),
                'total_edges': len(edges),
                'symptom_nodes': len(symptom_nodes),
                'disease_nodes': len(disease_nodes),
                'treatment_nodes': len(treatment_nodes),
                'avg_degree': round(sum(dict(G.degree()).values()) / len(G.nodes()), 2) if G.nodes() else 0,
                'density': round(nx.density(G), 3),
                'connected_components': nx.number_connected_components(G)
            }
            
            return {
                'nodes': nodes,
                'edges': edges,
                'stats': stats
            }
            
        except Exception as e:
            logger.error(f"Error building graph: {str(e)}")
            return self._build_fallback_graph(symptoms, diseases)
    
    async def _get_treatments_for_diseases(self, diseases: List[str]) -> Dict[str, List[str]]:
        """Get treatments for given diseases"""
        treatments = {}
        
        # Fallback treatment mapping
        default_treatments = {
            'common cold': ['Rest', 'Fluids', 'Over-the-counter medications'],
            'influenza': ['Rest', 'Antiviral medications', 'Symptomatic treatment'],
            'migraine': ['Pain relievers', 'Rest', 'Avoid triggers'],
            'food poisoning': ['Hydration', 'Bland diet', 'Medical attention'],
            'allergic reaction': ['Antihistamines', 'Avoid allergens', 'Medical evaluation'],
            'anxiety': ['Therapy', 'Relaxation techniques', 'Medical consultation'],
            'hypertension': ['Lifestyle changes', 'Medication', 'Regular monitoring'],
            'diabetes': ['Diet management', 'Exercise', 'Medication'],
            'asthma': ['Inhalers', 'Avoid triggers', 'Medical management'],
            'gastritis': ['Diet changes', 'Medications', 'Avoid irritants']
        }
        
        for disease in diseases:
            disease_key = disease.lower()
            disease_node = f"disease_{disease_key.replace(' ', '_')}"
            
            # Try to get from database first, then use fallback
            try:
                db_treatments = await self.db_client.get_treatments_for_disease(disease)
                treatments[disease_node] = db_treatments if db_treatments else default_treatments.get(disease_key, ['Medical consultation'])
            except:
                treatments[disease_node] = default_treatments.get(disease_key, ['Medical consultation'])
        
        return treatments
    
    async def _get_symptom_disease_relationships(self, symptoms: List[str], diseases: List[str]) -> Dict[tuple, float]:
        """Get relationship weights between symptoms and diseases"""
        relationships = {}
        
        # Simple rule-based relationships (in production, use ML or database)
        symptom_disease_map = {
            'fever': ['influenza', 'common cold', 'food poisoning'],
            'headache': ['migraine', 'hypertension', 'influenza'],
            'nausea': ['migraine', 'food poisoning', 'gastritis'],
            'cough': ['common cold', 'influenza', 'asthma'],
            'shortness of breath': ['asthma', 'anxiety'],
            'chest pain': ['anxiety', 'hypertension'],
            'fatigue': ['diabetes', 'depression', 'influenza'],
            'rash': ['allergic reaction'],
            'stomach pain': ['gastritis', 'food poisoning']
        }
        
        for symptom in symptoms:
            symptom_key = symptom.lower()
            symptom_node = f"symptom_{symptom_key.replace(' ', '_')}"
            
            related_diseases = []
            for key, disease_list in symptom_disease_map.items():
                if key in symptom_key or symptom_key in key:
                    related_diseases.extend(disease_list)
            
            for disease in diseases:
                disease_key = disease.lower()
                disease_node = f"disease_{disease_key.replace(' ', '_')}"
                
                # Calculate relationship strength
                if disease_key in related_diseases:
                    weight = 0.8
                elif any(d in disease_key for d in related_diseases):
                    weight = 0.6
                elif any(disease_key in d for d in related_diseases):
                    weight = 0.6
                else:
                    weight = 0.2  # Weak default connection
                
                relationships[(symptom_node, disease_node)] = weight
        
        return relationships
    
    def _build_fallback_graph(self, symptoms: List[str], diseases: List[str]) -> Dict[str, Any]:
        """Build a simple fallback graph when main graph building fails"""
        nodes = []
        edges = []
        
        # Add symptom nodes
        for i, symptom in enumerate(symptoms):
            nodes.append({
                'id': f'symptom_{i}',
                'label': symptom.title(),
                'type': 'symptom',
                'color': self.node_colors['symptom'],
                'size': self.node_sizes['symptom']
            })
        
        # Add disease nodes
        for i, disease in enumerate(diseases):
            nodes.append({
                'id': f'disease_{i}',
                'label': disease.title(), 
                'type': 'disease',
                'color': self.node_colors['disease'],
                'size': self.node_sizes['disease']
            })
        
        # Add simple connections (symptoms to diseases)
        for i, symptom in enumerate(symptoms):
            for j, disease in enumerate(diseases):
                edges.append({
                    'source': f'symptom_{i}',
                    'target': f'disease_{j}',
                    'weight': 0.5,
                    'type': 'indicates'
                })
        
        return {
            'nodes': nodes,
            'edges': edges,
            'stats': {
                'total_nodes': len(nodes),
                'total_edges': len(edges),
                'symptom_nodes': len(symptoms),
                'disease_nodes': len(diseases),
                'treatment_nodes': 0,
                'avg_degree': 2.0,
                'density': 0.5,
                'connected_components': 1
            }
        }
