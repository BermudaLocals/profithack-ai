import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

export interface TerminalHandle {
  write: (data: string) => void;
  writeln: (data: string) => void;
  clear: () => void;
  getXterm: () => XTerm | null;
}

interface TerminalProps {
  onCommand?: (command: string) => void;
}

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  ({ onCommand }, ref) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        xtermRef.current?.write(data);
      },
      writeln: (data: string) => {
        xtermRef.current?.writeln(data);
      },
      clear: () => {
        xtermRef.current?.clear();
      },
      getXterm: () => xtermRef.current,
    }));

    useEffect(() => {
      if (!terminalRef.current || xtermRef.current) return;

      const xterm = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#0a0a0a',
          foreground: '#e0e0e0',
          cursor: '#00ff00',
          selectionBackground: 'rgba(255, 255, 255, 0.3)',
          black: '#000000',
          red: '#ff5c57',
          green: '#5af78e',
          yellow: '#f3f99d',
          blue: '#57c7ff',
          magenta: '#ff6ac1',
          cyan: '#9aedfe',
          white: '#f1f1f0',
          brightBlack: '#686868',
          brightRed: '#ff5c57',
          brightGreen: '#5af78e',
          brightYellow: '#f3f99d',
          brightBlue: '#57c7ff',
          brightMagenta: '#ff6ac1',
          brightCyan: '#9aedfe',
          brightWhite: '#f1f1f0',
        },
        allowProposedApi: true,
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      xterm.loadAddon(fitAddon);
      xterm.loadAddon(webLinksAddon);
      xterm.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = xterm;
      fitAddonRef.current = fitAddon;

      xterm.writeln('Welcome to CreatorVerse Terminal');
      xterm.writeln('Type your commands below...');
      xterm.write('\r\n$ ');

      let currentLine = '';
      xterm.onData((data) => {
        const code = data.charCodeAt(0);

        if (code === 13) {
          xterm.write('\r\n');
          if (currentLine.trim() && onCommand) {
            onCommand(currentLine.trim());
          }
          currentLine = '';
          xterm.write('$ ');
        } else if (code === 127) {
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            xterm.write('\b \b');
          }
        } else if (code >= 32) {
          currentLine += data;
          xterm.write(data);
        }
      });

      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        xterm.dispose();
      };
    }, [onCommand]);

    return (
      <div 
        ref={terminalRef} 
        className="h-full w-full bg-black"
        data-testid="terminal-container"
      />
    );
  }
);

Terminal.displayName = 'Terminal';
