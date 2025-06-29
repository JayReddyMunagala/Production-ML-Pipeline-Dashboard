import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Bot, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  Cpu,
  X,
  Minimize2,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../hooks/useMockData';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  insights?: {
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
  }[];
}

interface AIAssistantProps {
  currentView: string;
}

export function AIAssistant({ currentView }: AIAssistantProps) {
  const { user } = useAuth();
  const { pipelines, datasets, alerts } = useMockData();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      logs: "I can help you analyze logs and diagnose issues."
    };

    const roleSpecificTips = user?.role === 'admin' 
      ? "As an admin, I can help with advanced configurations, system optimization, and team management."
      : "I can help you understand your data, interpret results, and learn ML concepts.";

    return {
      id: `msg_${Date.now()}`,
      type: 'assistant',
      content: `👋 Hello ${user?.name}! I'm your AI ML Assistant. ${contextualGreeting[currentView as keyof typeof contextualGreeting] || "I'm here to help with your machine learning tasks."}\n\n${roleSpecificTips}`,
      timestamp: new Date(),
      suggestions: generateContextualSuggestions()
    };
  };

  const generateContextualSuggestions = (): string[] => {
    const baseSuggestions = [
      "Explain model accuracy metrics",
      "How to improve data quality?",
      "What causes data drift?",
      "Optimize hyperparameters"
    ];

    const viewSpecificSuggestions = {
      dashboard: [
        "Analyze overall pipeline health",
        "Suggest performance improvements",
        "Explain current alerts"
      ],
      pipelines: [
        "Best algorithm for my data?",
        "How to reduce training time?",
        "Pipeline configuration tips"
      ],
      data: [
        "Check data quality issues",
        "Preprocessing recommendations",
        "Handle missing values"
      ],
      models: [
        "Compare model performance",
        "Feature importance analysis",
        "Model deployment tips"
      ],
      monitoring: [
        "Interpret drift scores",
        "Set up monitoring alerts",
        "Performance bottlenecks"
      ]
    };

    return [
      ...baseSuggestions,
      ...(viewSpecificSuggestions[currentView as keyof typeof viewSpecificSuggestions] || [])
    ];
  };

  const generateInsights = (input: string): Message['insights'] => {
    const insights = [];

    if (input.toLowerCase().includes('accuracy') || input.toLowerCase().includes('performance')) {
      insights.push({
        type: 'info' as const,
        title: 'Performance Insight',
        description: 'Your models are performing well overall. Consider A/B testing for further improvements.'
      });
    }

    if (input.toLowerCase().includes('drift')) {
      insights.push({
        type: 'warning' as const,
        title: 'Data Drift Alert',
        description: 'High drift detected in Sales Forecasting pipeline. Consider retraining with recent data.'
      });
    }

    if (input.toLowerCase().includes('data quality') || input.toLowerCase().includes('missing')) {
      insights.push({
        type: 'info' as const,
        title: 'Data Quality',
        description: 'Your datasets have low missing value rates. This is excellent for model training.'
      });
    }

    return insights;
  };

  const generateAIResponse = async (userInput: string): Promise<Message> => {
    // Simulate AI thinking time
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    setIsTyping(false);

    const input = userInput.toLowerCase();
    let response = '';
    let suggestions: string[] = [];
    let insights = generateInsights(userInput);

    // Context-aware responses
    if (input.includes('accuracy') || input.includes('performance')) {
      response = `🎯 **Model Performance Analysis**

Your current models show strong performance:
- Customer Churn: 89.2% accuracy (Good)
- Fraud Detection: 94.5% accuracy (Excellent)
- Sales Forecasting: 87.6% accuracy (Good)

**Recommendations:**
• Consider ensemble methods to boost accuracy by 2-3%
• Implement cross-validation for more robust evaluation
• Monitor for overfitting with validation curves

The Fraud Detection model is performing exceptionally well. For the others, you might benefit from feature engineering or hyperparameter tuning.`;

      suggestions = [
        "How to prevent overfitting?",
        "Feature engineering techniques",
        "Hyperparameter tuning guide",
        "Cross-validation best practices"
      ];
    }

    else if (input.includes('drift') || input.includes('monitoring')) {
      response = `📊 **Data Drift Analysis**

Current drift scores:
- Customer Churn: 0.15 (Normal)
- Fraud Detection: 0.08 (Low)
- Sales Forecasting: 0.22 (⚠️ Attention needed)

**High drift in Sales Forecasting suggests:**
• Market conditions have changed
• New customer behaviors
• Seasonal patterns not captured

**Action items:**
1. Retrain with last 3 months of data
2. Add temporal features
3. Set up automated retraining triggers`;

      suggestions = [
        "How to handle data drift?",
        "Automated retraining setup",
        "Feature monitoring strategies",
        "Temporal feature engineering"
      ];
    }

    else if (input.includes('data quality') || input.includes('missing') || input.includes('preprocessing')) {
      response = `🔍 **Data Quality Assessment**

Your datasets are in good shape:
- Average missing data: ${datasets.length > 0 ? (datasets.reduce((sum, d) => sum + d.null_percentage, 0) / datasets.length).toFixed(1) : 0}%
- Total records: ${datasets.reduce((sum, d) => sum + d.size, 0).toLocaleString()}

**Quality recommendations:**
• Customer dataset: 3.2% missing - Consider imputation for income field
• Implement data validation pipelines
• Add data lineage tracking
• Set up automated quality monitoring

**Preprocessing tips:**
- Use median imputation for numerical features
- Mode imputation for categorical features
- Consider creating "missing value" indicators`;

      suggestions = [
        "Best imputation methods",
        "Data validation techniques",
        "Outlier detection",
        "Feature scaling methods"
      ];
    }

    else if (input.includes('algorithm') || input.includes('model')) {
      response = `🤖 **Algorithm Recommendations**

Based on your data characteristics:

**For Classification:**
- Random Forest: Great starting point, handles mixed data types
- Gradient Boosting: Higher accuracy, requires tuning
- Neural Networks: Best for complex patterns, needs more data

**For your specific use cases:**
- **Churn Prediction**: Random Forest (interpretable + accurate)
- **Fraud Detection**: Isolation Forest + Neural Network ensemble
- **Sales Forecasting**: Time series models (ARIMA + LSTM)

**Next steps:**
1. A/B test Random Forest vs Gradient Boosting
2. Implement feature importance analysis
3. Consider automated ML for hyperparameter optimization`;

      suggestions = [
        "Feature importance analysis",
        "Hyperparameter optimization",
        "Model interpretability",
        "Ensemble methods guide"
      ];
    }

    else if (input.includes('alert') || input.includes('error') || input.includes('troubleshoot')) {
      const activeAlerts = alerts.filter(a => !a.acknowledged);
      response = `🚨 **Alert Analysis**

You have ${activeAlerts.length} active alerts:

${activeAlerts.map(alert => `• **${alert.severity.toUpperCase()}**: ${alert.message}`).join('\n')}

**Troubleshooting steps:**
1. Check data pipeline health
2. Verify model endpoints are responding
3. Monitor resource usage (CPU/Memory)
4. Review recent data changes

**Prevention:**
- Set up proactive monitoring
- Implement circuit breakers
- Add retry mechanisms with exponential backoff`;

      suggestions = [
        "How to prevent alerts?",
        "System health monitoring",
        "Error handling best practices",
        "Alerting configuration"
      ];
    }

    else if (input.includes('help') || input.includes('guide') || input.includes('how')) {
      response = `💡 **ML Pipeline Help**

I can assist you with:

**For ${user?.role === 'admin' ? 'Admins' : 'Users'}:**
${user?.role === 'admin' 
  ? '• Pipeline configuration & optimization\n• System monitoring & alerting\n• Data management & quality\n• Model deployment & scaling\n• Team collaboration & permissions'
  : '• Understanding model results\n• Data interpretation\n• Performance metrics explanation\n• Basic troubleshooting\n• Learning ML concepts'
}

**Common tasks:**
- Explain accuracy, precision, recall
- Analyze model performance trends
- Suggest data preprocessing steps
- Help with hyperparameter tuning
- Troubleshoot pipeline issues

What specific area would you like help with?`;

      suggestions = generateContextualSuggestions();
    }

    else {
      // Generic helpful response
      response = `🤔 I understand you're asking about "${userInput}".

Let me provide some relevant insights based on your current ${currentView} view:

${currentView === 'dashboard' ? '📈 Your ML pipelines are running smoothly with good overall performance.' : ''}
${currentView === 'pipelines' ? '⚙️ Your pipelines show varied performance - some opportunities for optimization.' : ''}
${currentView === 'data' ? '📊 Your data quality looks good with manageable missing value rates.' : ''}

I can help you with:
- Technical ML questions
- Performance optimization
- Data quality analysis
- Troubleshooting issues
- Best practices

Try asking something more specific, or use one of the suggestions below!`;

      suggestions = generateContextualSuggestions();
    }

    return {
      id: `msg_${Date.now()}`,
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      suggestions,
      insights
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    const aiResponse = await generateAIResponse(inputValue);
    setMessages(prev => [...prev, aiResponse]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
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
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <Bot size={12} />
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          AI Assistant
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
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200">AI Assistant</h3>
              <p className="text-xs text-slate-400">
                {isMinimized ? 'Click to expand' : 'ML Pipeline Helper'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-1">
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
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="text-xs text-slate-400 mb-2">💡 Try asking:</div>
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left text-xs text-blue-400 hover:text-blue-300 p-1 hover:bg-slate-600/50 rounded transition-colors"
                          >
                            "{suggestion}"
                          </button>
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                      <span className="text-sm">AI is thinking...</span>
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
                  placeholder="Ask me about ML pipelines, data, or models..."
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send size={16} />
                </Button>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                💡 Current context: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}