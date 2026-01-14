'use client'

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import OnChangePlugin from '@lexical/react/LexicalOnChangePlugin'
import {useEffect, useState} from 'react';

interface RestorePluginProps {
  state: string | null;
}

export default function RestorePlugin({ state }: RestorePluginProps) {
    const [editor] = useLexicalComposerContext()
   
    if(state !== null){
        const editorState = editor.parseEditorState(state);
        editor.setEditorState(editorState);
    }

    // return <button onClick={update}>Add a node</button>;
    return <></>;
    
  }