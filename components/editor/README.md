# Screenplay Formatting Toolbar

## Overview
The Screenplay Formatting Toolbar provides industry-standard screenplay formatting for the Lexical editor.

## Features

### Format Types
1. **Scene Heading** - `INT./EXT.` locations (Bold, uppercase)
2. **Character** - Character names (Uppercase, centered at 35% margin)
3. **Dialogue** - Character speech (20% left margin)
4. **Parenthetical** - Stage directions (Italic, 30% left margin)
5. **Action** - Scene descriptions (Normal paragraph)
6. **Transition** - Scene transitions (Uppercase, right-aligned)
7. **Normal** - Standard text formatting

### Keyboard Shortcuts
- `Ctrl+Shift+H` - Scene Heading
- `Ctrl+Shift+C` - Character Name
- `Ctrl+Shift+D` - Dialogue
- `Ctrl+Shift+A` - Action/Description
- `Ctrl+Shift+T` - Transition
- `Ctrl+Shift+N` - Normal Text
- `Tab` - Cycle through formats

### How to Use
1. Click on a format button in the toolbar
2. Or use keyboard shortcuts while typing
3. Or press Tab to cycle through formats sequentially
4. The active format is highlighted in purple

### Industry Standards
All formatting follows standard screenplay conventions:
- Courier Prime font (monospace)
- Proper margins and indentation
- Professional spacing
- Industry-standard element positioning

## Technical Details

### CSS Classes Applied
- `.screenplay-scene-heading`
- `.screenplay-character`
- `.screenplay-dialogue`
- `.screenplay-parenthetical`
- `.screenplay-action`
- `.screenplay-transition`

### Integration
The toolbar is automatically included in both:
- Normal editing mode (with AI Copilot)
- Distraction-free mode (full-screen editor)

## Example Workflow
1. Type scene heading: `INT. COFFEE SHOP - DAY`
2. Press `Ctrl+Shift+H` to format as Scene Heading
3. Press Enter, then `Ctrl+Shift+C` for Character name: `JOHN`
4. Press Enter, then `Ctrl+Shift+D` for Dialogue: `I can't believe it.`
5. Press `Tab` to automatically move to next format type
