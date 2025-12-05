import { useState, useEffect, useRef } from 'react';
import { Terminal, X, Download } from 'lucide-react';

interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  timestamp: Date;
  message: string;
  source?: string;
}

interface ConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
  onDownload: () => void;
}

export const Console: React.FC<ConsoleProps> = ({ messages, onClear, onDownload }) => {
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(msg => {
    if (filter !== 'all' && msg.type !== filter) return false;
    if (searchTerm && !msg.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <div className={`bg-gray-900 border-t border-gray-700 ${isExpanded ? 'h-64' : 'h-8'}`}>
      <div className="bg-gray-800 px-4 py-1 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-gray-400" />
          <span className="text-sm text-gray-300">Console</span>
          <span className="text-xs text-gray-500" data-testid="text-message-count">({filteredMessages.length} messages)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['all', 'log', 'error', 'warn', 'info'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-2 py-1 text-xs rounded ${filter === type ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
                data-testid={`button-filter-${type}`}
              >
                {type}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-700 rounded outline-none text-white"
            data-testid="input-search-console"
          />

          <button onClick={onClear} className="p-1 hover:bg-gray-700 rounded text-white" title="Clear console" data-testid="button-clear-console">
            <X size={14} />
          </button>

          <button onClick={onDownload} className="p-1 hover:bg-gray-700 rounded text-white" title="Download logs" data-testid="button-download-logs">
            <Download size={14} />
          </button>

          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-gray-700 rounded text-white" title="Toggle console" data-testid="button-toggle-console">
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          ref={consoleRef}
          className="p-2 font-mono text-sm overflow-auto h-52"
          onClick={() => {
            navigator.clipboard.writeText(
              filteredMessages.map(msg => `${msg.type}: ${msg.message}`).join('\n')
            );
          }}
        >
          {filteredMessages.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No messages</div>
          ) : (
            filteredMessages.map(msg => (
              <div
                key={msg.id}
                className={`mb-1 ${getMessageColor(msg.type)} hover:bg-gray-800 p-1 rounded cursor-pointer`}
                data-testid={`console-message-${msg.type}`}
              >
                <span className="mr-2">{getMessageIcon(msg.type)}</span>
                <span className="text-gray-500 text-xs mr-2">
                  [{msg.timestamp.toLocaleTimeString()}]
                </span>
                {msg.source && <span className="text-gray-400 text-xs mr-2">[{msg.source}]</span>}
                <span className="break-all">{msg.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
