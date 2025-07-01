import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Bot, 
  Send, 
  X,
  Minimize2,
  Maximize2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  insights?: {
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
  }[];
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  currentView: string;
}

export function AIAssistant({ currentView }: AIAssistantProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const isApiKeyConfigured = apiKey && apiKey !== 'your_openai_api_key_here';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial AI greeting based on user role and current view
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = generateWelcomeMessage();
      setMessages([welcomeMessage]);
    }
  }, [isOpen, currentView, user?.role]);

  const generateWelcomeMessage = (): Message => {
    const contextualGreeting = {
      dashboard: "I can help you understand your ML pipeline performance and suggest optimizations.",
      pipelines: "I can assist with pipeline creation, optimization, and troubleshooting.",
      data: "I can help with data quality analysis, preprocessing recommendations, and dataset insights.",
      models: "I can provide insights on model performance and suggest improvements.",
      monitoring: "I can help you interpret monitoring data and identify potential issues.",
      alerts: "I can help you understand and resolve system alerts.",
      logs: "I can help you analyze logs and diagnose issues.",
      sync: "I can help you understand data synchronization and resolve sync issues.",
      settings: "I can help you configure system settings and optimize your workflow."
    };

    const roleSpecificTips = user?.role === 'admin' 
      ? "As an admin, I can help with advanced configurations, system optimization, and team management."
      : "I can help you understand your data, interpret results, and learn ML concepts.";

    if (!isApiKeyConfigured) {
      return {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        content: `👋 Hello ${user?.name}! I'm your AI ML Assistant, but I'm currently not configured. Please contact your administrator to set up the OpenAI API key in the environment configuration.`,
        timestamp: new Date(),
        insights: [{
          type: 'warning',
          title: 'Configuration Required',
          description: 'OpenAI API key needs to be configured in the .env file to enable AI assistance.'
        }]
      };
    }

    return {
      id: `msg_${Date.now()}`,
      type: 'assistant',
      content: `👋 Hello ${user?.name}! I'm your AI ML Assistant. ${contextualGreeting[currentView as keyof typeof contextualGreeting] || "I'm here to help with your machine learning tasks."}\n\n${roleSpecificTips}\n\nWhat would you like to know about your ML pipelines today?`,
      timestamp: new Date(),
    };
  };

  const convertMessagesToOpenAI = (messages: Message[]): OpenAIMessage[] => {
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: `You are an AI assistant for an ML Pipeline Dashboard. You help users understand machine learning workflows, data analysis, model performance, and troubleshooting. 

Context: The user is currently viewing the "${currentView}" section of the dashboard.
User role: ${user?.role || 'user'}

Provide helpful, accurate information about:
- Machine learning concepts and best practices
- Data preprocessing and quality analysis  
- Model training, evaluation, and optimization
- Pipeline configuration and troubleshooting
- Monitoring and performance analysis
- Data synchronization and management

Be concise but informative. Use clear explanations and provide actionable advice when possible.

If you want to highlight important information, you can use these special formats:
- Start a line with "Warning: " for important warnings
- Start a line with "Info: " for helpful information
- Start a line with "Success: " for positive feedback
- Start a line with "Tip: " for helpful tips

These will be displayed as special highlighted sections in the UI.`
    };

    const formattedMessages = messages.map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    return [systemMessage, ...formattedMessages];
  };

  const callOpenAIAPI = async (userInput: string): Promise<string> => {
    if (!isApiKeyConfigured) {
      throw new Error('OpenAI API key is not configured. Please contact your administrator to set up the VITE_OPENAI_API_KEY environment variable.');
    }

    // Use current messages array (which already includes the new user message)
    const openAIMessages = convertMessagesToOpenAI(messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: openAIMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content;
  };

  const parseInsights = (content: string): { content: string; insights: Message['insights'] } => {
    const insights: Message['insights'] = [];
    let cleanedContent = content;

    // Define patterns to match different insight types
    const patterns = [
      {
        regex: /(?:^|\n)\s*Warning:\s*(.+?)(?=\n(?:Info:|Success:|Warning:|Alert:|Tip:|Note:|$)|$)/gis,
        type: 'warning' as const,
        title: 'Warning'
      },
      {
        regex: /(?:^|\n)\s*Info:\s*(.+?)(?=\n(?:Info:|Success:|Warning:|Alert:|Tip:|Note:|$)|$)/gis,
        type: 'info' as const,
        title: 'Information'
      },
      {
        regex: /(?:^|\n)\s*Success:\s*(.+?)(?=\n(?:Info:|Success:|Warning:|Alert:|Tip:|Note:|$)|$)/gis,
        type: 'success' as const,
        title: 'Success'
      },
      {
        regex: /(?:^|\n)\s*Alert:\s*(.+?)(?=\n(?:Info:|Success:|Warning:|Alert:|Tip:|Note:|$)|$)/gis,
        type: 'warning' as const,
        title: 'Alert'
      },
      {
        regex: /(?:^|\n)\s*Tip:\s*(.+?)(?=\n(?:Info:|Success:|Warning:|Alert:|Tip:|Note:|$)|$)/gis,
        type: 'info' as const,
        title: 'Tip'
      },
      {
        regex: /(?:^|\n)\s*Note:\s*(.+?)(?=\n(?:Info:|Success:|Warning:|Alert:|Tip:|Note:|$)|$)/gis,
        type: 'info' as const,
        title: 'Note'
      }
    ];

    // Extract insights from content
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        const description = match[1].trim();
        if (description) {
          insights.push({
            type: pattern.type,
            title: pattern.title,
            description: description
          });
          
          // Remove the matched insight from the main content
          cleanedContent = cleanedContent.replace(match[0], '');
        }
      }
      // Reset regex for next iteration
      pattern.regex.lastIndex = 0;
    });

    // Clean up extra whitespace and line breaks
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    return {
      content: cleanedContent,
      insights: insights.length > 0 ? insights : undefined
    };
  };

  const generateAIResponse = async (userInput: string): Promise<Message> => {
    try {
      const responseContent = await callOpenAIAPI(userInput);
      
      // Parse the response for insights
      const { content, insights } = parseInsights(responseContent);
      
      return {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        content: content,
        timestamp: new Date(),
        insights: insights,
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      return {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        content: `❌ I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please check your API configuration or try again later.`,
        timestamp: new Date(),
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!isApiKeyConfigured) {
      // Add a message explaining the configuration issue
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        content: "I'm unable to process your request because the OpenAI API key is not configured. Please contact your administrator to set up the VITE_OPENAI_API_KEY environment variable.",
        timestamp: new Date(),
        insights: [{
          type: 'warning',
          title: 'Configuration Required',
          description: 'Contact your system administrator to configure the OpenAI API key in the environment variables.'
        }]
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add the new user message to the messages array
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Set typing state while waiting for OpenAI response
    setIsTyping(true);

    // Call OpenAI with the full conversation and append assistant reply
    const aiResponse = await generateAIResponse(inputValue);
    
    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
      >
        <MessageCircle size={24} />
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
          isApiKeyConfigured ? 'bg-green-500' : 'bg-yellow-500'
        }`}>
          <Bot size={12} />
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {isApiKeyConfigured ? 'AI Assistant' : 'AI Assistant (Config Needed)'}
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <Card className="h-full flex flex-col shadow-2xl border-blue-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${isApiKeyConfigured ? 'bg-blue-600' : 'bg-yellow-600'}`}>
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200">AI Assistant</h3>
              <p className="text-xs text-slate-400">
                {isMinimized ? 'Click to expand' : isApiKeyConfigured ? 'ML Pipeline Helper' : 'Configuration Required'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {!isApiKeyConfigured && (
              <div className="p-1 text-yellow-400" title="API Key Configuration Required">
                <AlertTriangle size={16} />
              </div>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-200'
                  } rounded-lg p-3`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    
                    {message.insights && message.insights.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.insights.map((insight, index) => (
                          <div key={index} className={`p-2 rounded border-l-3 ${
                            insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500' :
                            insight.type === 'success' ? 'bg-green-900/20 border-green-500' :
                            'bg-blue-900/20 border-blue-500'
                          }`}>
                            <div className="font-medium text-xs">{insight.title}</div>
                            <div className="text-xs text-slate-400 mt-1">{insight.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-500 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-200 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm">Assistant is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-700 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isApiKeyConfigured ? "Ask me about ML pipelines, data, or models..." : "API key configuration required..."}
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  disabled={!isApiKeyConfigured}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || !isApiKeyConfigured}
                >
                  <Send size={16} />
                </Button>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                💡 Current context: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                {!isApiKeyConfigured && ' • Configuration required'}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}