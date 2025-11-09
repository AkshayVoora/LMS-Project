'use client';

import React, { useMemo, useState, useEffect } from 'react';

interface PlateEditorProps {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
}

export default function PlateEditor({ value, onChange, placeholder = 'Start typing...' }: PlateEditorProps) {
  const defaultValue = [
    {
      type: 'p',
      children: [{ text: '' }],
    },
  ];

  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      const text = value
        .map((node: any) => {
          if (node.children) {
            return node.children.map((child: any) => child.text || '').join('');
          }
          return '';
        })
        .join('\n');
      setTextContent(text);
    } else {
      setTextContent('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextContent(text);
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const plateValue = lines.length > 0
      ? lines.map((line) => ({
          type: 'p',
          children: [{ text: line }],
        }))
      : defaultValue;
    
    onChange(plateValue);
  };

  return (
    <div className="border border-gray-300 rounded-md bg-white">
      <div className="border-b border-gray-200 p-2 bg-gray-50">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="font-medium">Text Editor</span>
          <span className="text-gray-400">|</span>
          <span className="text-xs">Enter content for your chapter</span>
        </div>
      </div>
      <div className="p-4">
        <textarea
          value={textContent}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full min-h-[250px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y"
          rows={10}
        />
      </div>
    </div>
  );
}

