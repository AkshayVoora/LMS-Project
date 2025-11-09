'use client';

import React, { useMemo } from 'react';
import { Plate, PlateContent, createPlateEditor } from '@udecode/plate-common';
import {
  ParagraphPlugin,
  HeadingPlugin,
  BlockquotePlugin,
  BulletedListPlugin,
  NumberedListPlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
} from '@udecode/plate-basic-elements';
import { CodeBlockPlugin } from '@udecode/plate-code-block';
import { LinkPlugin } from '@udecode/plate-link';

const plugins = [
  ParagraphPlugin,
  HeadingPlugin,
  BlockquotePlugin,
  BulletedListPlugin,
  NumberedListPlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
  CodeBlockPlugin,
  LinkPlugin,
];

interface PlateEditorProps {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
}

export default function PlateEditor({ value, onChange, placeholder = 'Start typing...' }: PlateEditorProps) {
  const editor = useMemo(() => createPlateEditor({ plugins }), []);

  const defaultValue = [
    {
      type: 'p',
      children: [{ text: '' }],
    },
  ];

  return (
    <div className="border border-gray-300 rounded-md bg-white">
      <div className="border-b border-gray-200 p-2 bg-gray-50">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="font-medium">Rich Text Editor</span>
          <span className="text-gray-400">|</span>
          <span className="text-xs">Use keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic)</span>
        </div>
      </div>
      <div className="p-4 min-h-[300px]">
        <Plate
          editor={editor}
          value={value || defaultValue}
          onChange={({ value }) => onChange(value)}
        >
          <PlateContent
            className="outline-none min-h-[250px] prose max-w-none"
            placeholder={placeholder}
          />
        </Plate>
      </div>
    </div>
  );
}

