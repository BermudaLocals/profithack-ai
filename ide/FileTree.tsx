import { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, Plus, Edit, Download, Copy, Trash2 } from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  path: string;
}

interface FileTreeProps {
  files: TreeNode[];
  onFileSelect: (path: string) => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
  onRename: (oldPath: string, newPath: string) => void;
  onDelete: (path: string) => void;
  onDownload: (path: string) => void;
  selectedPath?: string;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onDownload,
  selectedPath
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: TreeNode } | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const renderNode = (node: TreeNode, level: number = 0): JSX.Element => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedPath === node.path;
    const isEditing = editingNode === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center px-2 py-1 hover:bg-gray-800 cursor-pointer group ${isSelected ? 'bg-gray-700' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'file') {
              onFileSelect(node.path);
            } else {
              toggleFolder(node.path);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, node });
          }}
          data-testid={`filetree-${node.type}-${node.id}`}
        >
          {node.type === 'folder' && (
            <span className="mr-1">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          
          <span className="mr-2">
            {node.type === 'folder' ? (isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />) : <File size={16} />}
          </span>

          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                if (editValue.trim()) {
                  onRename(node.path, node.path.replace(/[^/]+$/, editValue));
                }
                setEditingNode(null);
                setEditValue('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (editValue.trim()) {
                    onRename(node.path, node.path.replace(/[^/]+$/, editValue));
                  }
                  setEditingNode(null);
                  setEditValue('');
                }
                if (e.key === 'Escape') {
                  setEditingNode(null);
                  setEditValue('');
                }
              }}
              className="bg-gray-700 text-white px-1 rounded outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              data-testid="input-rename-file"
            />
          ) : (
            <span className="text-sm text-gray-300">{node.name}</span>
          )}

          <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingNode(node.id);
                setEditValue(node.name);
              }}
              className="p-1 hover:bg-gray-600 rounded"
              data-testid="button-rename"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(node.path);
              }}
              className="p-1 hover:bg-gray-600 rounded"
              data-testid="button-download"
            >
              <Download size={12} />
            </button>
          </div>
        </div>

        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white h-full relative">
      <div className="p-2 border-b border-gray-700 flex gap-2">
        <button
          onClick={() => {
            const path = prompt('Enter file name:');
            if (path) onCreateFile(path);
          }}
          className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center gap-1"
          data-testid="button-create-file"
        >
          <Plus size={14} />
          File
        </button>
        <button
          onClick={() => {
            const path = prompt('Enter folder name:');
            if (path) onCreateFolder(path);
          }}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center gap-1"
          data-testid="button-create-folder"
        >
          <Plus size={14} />
          Folder
        </button>
      </div>

      <div className="overflow-auto">
        {files.map(node => renderNode(node))}
      </div>

      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-700 rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <button
            className="px-4 py-2 hover:bg-gray-700 w-full text-left text-sm flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setEditingNode(contextMenu.node.id);
              setEditValue(contextMenu.node.name);
              setContextMenu(null);
            }}
            data-testid="menu-rename"
          >
            <Edit size={14} /> Rename
          </button>
          <button
            className="px-4 py-2 hover:bg-gray-700 w-full text-left text-sm flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(contextMenu.node.path);
              setContextMenu(null);
            }}
            data-testid="menu-download"
          >
            <Download size={14} /> Download
          </button>
          <button
            className="px-4 py-2 hover:bg-gray-700 w-full text-left text-sm flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(contextMenu.node.path);
              setContextMenu(null);
            }}
            data-testid="menu-copy-path"
          >
            <Copy size={14} /> Copy Path
          </button>
          <div className="border-t border-gray-700 my-1"></div>
          <button
            className="px-4 py-2 hover:bg-gray-700 w-full text-left text-sm flex items-center gap-2 text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${contextMenu.node.name}?`)) {
                onDelete(contextMenu.node.path);
              }
              setContextMenu(null);
            }}
            data-testid="menu-delete"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};
