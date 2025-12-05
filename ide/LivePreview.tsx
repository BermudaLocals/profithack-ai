import { useState, useRef } from 'react';
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface LivePreviewProps {
  url: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ url, onRefresh, isLoading = false }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    onRefresh();
  };

  return (
    <div className={`bg-gray-900 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Preview</span>
          {isLoading && <RefreshCw className="animate-spin size-4 text-gray-400" />}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
              title="Desktop"
              data-testid="button-preview-desktop"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1 rounded ${deviceMode === 'tablet' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
              title="Tablet"
              data-testid="button-preview-tablet"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
              title="Mobile"
              data-testid="button-preview-mobile"
            >
              <Smartphone size={16} />
            </button>
          </div>

          <button onClick={refreshPreview} className="p-1 hover:bg-gray-700 rounded" title="Refresh" data-testid="button-refresh-preview">
            <RefreshCw size={16} />
          </button>

          <button onClick={() => window.open(url, '_blank')} className="p-1 hover:bg-gray-700 rounded" title="Open in new tab" data-testid="button-open-new-tab">
            <ExternalLink size={16} />
          </button>

          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1 hover:bg-gray-700 rounded" title="Toggle fullscreen" data-testid="button-toggle-fullscreen">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-gray-950">
        {url ? (
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-gray-700"
            style={{
              width: deviceSizes[deviceMode].width,
              height: deviceSizes[deviceMode].height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; vr"
              data-testid="iframe-preview"
            />
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <Monitor size={48} className="mx-auto mb-4 opacity-50" />
            <p>Run your project to see preview</p>
          </div>
        )}
      </div>
    </div>
  );
};
