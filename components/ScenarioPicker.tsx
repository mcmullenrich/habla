'use client';

export interface Scenario {
  id: string;
  emoji: string;
  title: string;
  description: string;
  prompt: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'cafe',
    emoji: '☕',
    title: 'En el café',
    description: 'Order coffee and chat with the barista',
    prompt: 'You are a friendly barista at a café in Mexico City. Greet the user and ask what they would like to order. Make small talk about the weather or their day.',
  },
  {
    id: 'directions',
    emoji: '🗺️',
    title: 'Pidiendo direcciones',
    description: 'Ask for and give directions around town',
    prompt: 'You are a helpful local in a Spanish-speaking city. The user is a tourist who needs directions. Start by asking where they are trying to go.',
  },
  {
    id: 'doctor',
    emoji: '🏥',
    title: 'En el consultorio',
    description: 'Describe symptoms at a doctor\'s visit',
    prompt: 'You are a doctor at a clinic. Greet the patient and ask them what brings them in today. Ask follow-up questions about their symptoms.',
  },
  {
    id: 'mercado',
    emoji: '🛒',
    title: 'En el mercado',
    description: 'Shop and haggle at an outdoor market',
    prompt: 'You are a vendor at an outdoor market selling fruits, vegetables, and spices. Greet the customer warmly and show them what you have today. Be open to friendly haggling.',
  },
  {
    id: 'fiesta',
    emoji: '🎉',
    title: 'En la fiesta',
    description: 'Meet new people at a party',
    prompt: 'You are a guest at a friend\'s party. You just met the user. Introduce yourself and make conversation — ask about their life, hobbies, and how they know the host.',
  },
  {
    id: 'free',
    emoji: '💬',
    title: 'Conversación libre',
    description: 'Open conversation — talk about anything',
    prompt: 'Start a casual, open-ended conversation. Ask the user about their day, interests, or something fun. Let the conversation flow naturally wherever it goes.',
  },
];

interface ScenarioPickerProps {
  onSelect: (scenario: Scenario) => void;
}

export default function ScenarioPicker({ onSelect }: ScenarioPickerProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">¿De qué quieres hablar?</h2>
          <p className="text-gray-400 mt-1 text-sm">Pick a conversation scenario</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className="flex flex-col items-start p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl transition-colors text-left"
            >
              <span className="text-2xl mb-2">{scenario.emoji}</span>
              <span className="text-white font-medium text-sm">{scenario.title}</span>
              <span className="text-gray-400 text-xs mt-1">{scenario.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
