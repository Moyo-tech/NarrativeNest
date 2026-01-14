/**
 * Demo document content for onboarding
 * "The Lagos Assignment" - A Nigerian screenplay sample
 */

export const DEMO_DOCUMENT_TITLE = 'The Lagos Assignment';

export const DEMO_DOCUMENT_CONTENT = `
# The Lagos Assignment

## FADE IN:

### INT. LAGOS AIRPORT - ARRIVALS HALL - DAY

*The bustling arrivals hall is packed with travelers, families, and drivers holding name signs. AMARA OKONKWO (32), a sharp-eyed journalist with natural hair and a determined stride, pushes through the crowd, pulling a small carry-on.*

*Her phone buzzes. She glances at the screen: "EDITOR - URGENT"*

**AMARA**
(into phone)
I just landed. Yes, I know the stakes.

*She navigates past a group of tourists and spots her ride - KUNLE (45), a weathered man in a faded agbada, holding a hand-written sign: "OKONKWO"*

**KUNLE**
Madam Amara? I be Kunle. Your people send me.

**AMARA**
(cautious)
Who exactly are "my people"?

**KUNLE**
(lowering voice)
The ones wey wan make sure say you reach Victoria Island alive.

*Amara exchanges a look with him. She follows.*

---

### EXT. LAGOS STREETS - THIRD MAINLAND BRIDGE - CONTINUOUS

*Kunle's battered Toyota navigates the legendary Lagos traffic - okadas weaving between cars, hawkers selling everything from phone chargers to chin-chin.*

**KUNLE**
First time for Lagos?

**AMARA**
I left when I was twelve. But I remember.

*She gazes out at the skyline - old colonial buildings beside gleaming new towers. The contrast of wealth and struggle.*

**KUNLE**
Lagos don change plenty. But some things remain.

**AMARA**
Like what?

**KUNLE**
(meaningful)
The people wey dey control am. Dem never change.

*Amara's expression hardens. This is exactly why she's here.*

---

### INT. VICTORIA ISLAND - HOTEL LOBBY - LATER

*A five-star hotel dripping with luxury. Amara checks in, aware of the security guards eyeing her.*

*Her phone buzzes again. A text from an unknown number:*

> "You have 48 hours. The documents are with Mama Calabar. Third shop, Balogun Market. Come alone."

*Amara deletes the message and pockets her phone.*

---

### INT. HOTEL ROOM - NIGHT

*Amara unpacks her bag. Hidden beneath her clothes - a small voice recorder and a thumb drive.*

*She opens her laptop and stares at the headline she's drafting:*

> "LAGOS OIL SCANDAL: HOW BILLIONS DISAPPEARED"

*She takes a deep breath and begins to type.*

**AMARA (V.O.)**
In Lagos, everyone has a price. My job is to find out who's been paid.

---

## END OF TEASER

---

*This is a sample screenplay to help you explore NarrativeNest's features. Try using the slash commands (/) to format your text, or select text to use the Magic Wand for AI-powered rewrites!*
`;

export const DEMO_CHAPTERS = [
  {
    title: 'Opening - Airport',
    type: 'scene' as const,
    content: `### INT. LAGOS AIRPORT - ARRIVALS HALL - DAY

*The bustling arrivals hall is packed with travelers, families, and drivers holding name signs. AMARA OKONKWO (32), a sharp-eyed journalist with natural hair and a determined stride, pushes through the crowd, pulling a small carry-on.*

*Her phone buzzes. She glances at the screen: "EDITOR - URGENT"*

**AMARA**
(into phone)
I just landed. Yes, I know the stakes.

*She navigates past a group of tourists and spots her ride - KUNLE (45), a weathered man in a faded agbada, holding a hand-written sign: "OKONKWO"*

**KUNLE**
Madam Amara? I be Kunle. Your people send me.

**AMARA**
(cautious)
Who exactly are "my people"?

**KUNLE**
(lowering voice)
The ones wey wan make sure say you reach Victoria Island alive.

*Amara exchanges a look with him. She follows.*`,
  },
  {
    title: 'Third Mainland Bridge',
    type: 'scene' as const,
    content: `### EXT. LAGOS STREETS - THIRD MAINLAND BRIDGE - CONTINUOUS

*Kunle's battered Toyota navigates the legendary Lagos traffic - okadas weaving between cars, hawkers selling everything from phone chargers to chin-chin.*

**KUNLE**
First time for Lagos?

**AMARA**
I left when I was twelve. But I remember.

*She gazes out at the skyline - old colonial buildings beside gleaming new towers. The contrast of wealth and struggle.*

**KUNLE**
Lagos don change plenty. But some things remain.

**AMARA**
Like what?

**KUNLE**
(meaningful)
The people wey dey control am. Dem never change.

*Amara's expression hardens. This is exactly why she's here.*`,
  },
  {
    title: 'Hotel Check-in',
    type: 'scene' as const,
    content: `### INT. VICTORIA ISLAND - HOTEL LOBBY - LATER

*A five-star hotel dripping with luxury. Amara checks in, aware of the security guards eyeing her.*

*Her phone buzzes again. A text from an unknown number:*

> "You have 48 hours. The documents are with Mama Calabar. Third shop, Balogun Market. Come alone."

*Amara deletes the message and pockets her phone.*`,
  },
  {
    title: 'The Mission',
    type: 'scene' as const,
    content: `### INT. HOTEL ROOM - NIGHT

*Amara unpacks her bag. Hidden beneath her clothes - a small voice recorder and a thumb drive.*

*She opens her laptop and stares at the headline she's drafting:*

> "LAGOS OIL SCANDAL: HOW BILLIONS DISAPPEARED"

*She takes a deep breath and begins to type.*

**AMARA (V.O.)**
In Lagos, everyone has a price. My job is to find out who's been paid.`,
  },
];

/**
 * Convert demo content to Lexical editor state
 */
export function createDemoEditorState(): string {
  // Create a simple paragraph-based editor state
  const root = {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'The Lagos Assignment',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'heading',
          version: 1,
          tag: 'h1',
        },
        {
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Welcome to NarrativeNest! This is a sample screenplay to help you explore the features.',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 1,
              mode: 'normal',
              style: '',
              text: 'Try these features:',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '- Type "/" to open slash commands for formatting',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '- Select text to see the Magic Wand for AI rewrites',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '- Use the Beat Board for story structure tools',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '- Try the Story Generator to create a full story outline',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'INT. LAGOS AIRPORT - ARRIVALS HALL - DAY',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'heading',
          version: 1,
          tag: 'h3',
        },
        {
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 2,
              mode: 'normal',
              style: '',
              text: 'The bustling arrivals hall is packed with travelers, families, and drivers holding name signs. AMARA OKONKWO (32), a sharp-eyed journalist with natural hair and a determined stride, pushes through the crowd, pulling a small carry-on.',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 2,
              mode: 'normal',
              style: '',
              text: "Her phone buzzes. She glances at the screen: \"EDITOR - URGENT\"",
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 1,
              mode: 'normal',
              style: '',
              text: 'AMARA',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: 'center',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 2,
              mode: 'normal',
              style: '',
              text: '(into phone)',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: 'center',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'I just landed. Yes, I know the stakes.',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: 'center',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 2,
              mode: 'normal',
              style: '',
              text: 'She navigates past a group of tourists and spots her ride - KUNLE (45), a weathered man in a faded agbada, holding a hand-written sign: "OKONKWO"',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };

  return JSON.stringify(root);
}
