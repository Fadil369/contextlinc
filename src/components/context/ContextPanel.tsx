'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useContextUpdates } from '@/hooks/useAPI';

interface ContextLayer {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'processing';
  data?: any;
}

export function ContextPanel() {
  const [expandedLayers, setExpandedLayers] = useState<number[]>([1, 2, 5]);
  const { contextState, loading, error, refreshContext } = useContextUpdates();
  
  const contextLayers: ContextLayer[] = [
    {
      id: 1,
      name: 'Instructions',
      description: 'AI constitution, persona, goals, ethical boundaries',
      status: 'active',
      data: {
        persona: 'Context-aware AI assistant',
        capabilities: ['Multi-modal processing', 'Context engineering', 'Memory management'],
        boundaries: ['Privacy protection', 'Factual accuracy', 'Helpful responses']
      }
    },
    {
      id: 2,
      name: 'User Info',
      description: 'Personalization data, preferences, account details',
      status: 'active',
      data: {
        session: 'Anonymous user',
        preferences: 'Standard context processing',
        interaction_count: 0
      }
    },
    {
      id: 3,
      name: 'Knowledge',
      description: 'Retrieved documents and domain expertise through RAG',
      status: 'inactive',
      data: {
        documents: 0,
        embeddings: 0,
        last_update: 'Never'
      }
    },
    {
      id: 4,
      name: 'Task/Goal State',
      description: 'Multi-step task management and workflow tracking',
      status: 'inactive',
      data: {
        current_task: 'None',
        workflow_state: 'Idle',
        progress: 0
      }
    },
    {
      id: 5,
      name: 'Memory',
      description: 'Short, medium, and long-term memory systems',
      status: 'active',
      data: {
        short_term: 'Current conversation (0 messages)',
        medium_term: 'Session memory (empty)',
        long_term: 'Semantic memory (empty)'
      }
    },
    {
      id: 6,
      name: 'Tools',
      description: 'External tool definitions and capabilities',
      status: 'inactive',
      data: {
        available_tools: ['File processor', 'Web search', 'Code executor'],
        active_tools: 0
      }
    }
  ];

  const toggleLayer = (layerId: number) => {
    setExpandedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const getStatusColor = (status: ContextLayer['status']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'inactive': return 'text-dark-500';
    }
  };

  const getStatusDot = (status: ContextLayer['status']) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'processing': return 'bg-yellow-400 animate-pulse';
      case 'inactive': return 'bg-dark-600';
    }
  };

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-700 p-6">
      <h3 className="font-semibold text-white mb-4">Context Layers</h3>
      <p className="text-sm text-dark-400 mb-4">
        11-Layer Context Window Architecture status
      </p>
      
      <div className="space-y-2">
        {contextLayers.map((layer) => (
          <div key={layer.id} className="border border-dark-700 rounded-lg">
            <button
              onClick={() => toggleLayer(layer.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-dark-800 transition-colors rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${getStatusDot(layer.status)}`}></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">
                      {layer.id}. {layer.name}
                    </span>
                    <span className={`text-xs ${getStatusColor(layer.status)}`}>
                      {layer.status}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400">{layer.description}</p>
                </div>
              </div>
              {expandedLayers.includes(layer.id) ? (
                <ChevronDownIcon className="w-4 h-4 text-dark-400" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-dark-400" />
              )}
            </button>
            
            {expandedLayers.includes(layer.id) && (
              <div className="px-3 pb-3 border-t border-dark-700 mt-2 pt-2">
                <div className="bg-dark-800 rounded p-2">
                  <pre className="text-xs text-dark-300 whitespace-pre-wrap">
                    {JSON.stringify(layer.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Remaining layers placeholder */}
        <div className="text-center py-2">
          <span className="text-xs text-dark-500">
            Layers 7-11: Examples, Context, Constraints, Output Format, User Query
          </span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-dark-800 rounded-lg border border-dark-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-300">Context Status</span>
          <span className="text-primary-400">Processing Ready</span>
        </div>
        <div className="mt-2 w-full bg-dark-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full w-1/3"></div>
        </div>
        <p className="text-xs text-dark-500 mt-1">
          3 of 6 core layers active
        </p>
      </div>
    </div>
  );
}