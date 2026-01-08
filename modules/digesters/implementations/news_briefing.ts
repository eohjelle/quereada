import OpenAI from 'openai';
import type { DigesterConstructor, DigestItem } from '../index';

const openai = new OpenAI();

/**
 * NewsBriefing digester: Creates a summary/briefing of multiple news items.
 *
 * The output references items using [item:ID] syntax, which the frontend
 * parses into clickable links that expand to show the full item.
 *
 * @param focus_areas - Optional array of topics to focus on in the briefing
 */
export const NewsBriefing: DigesterConstructor<{ focus_areas?: string[] }> = ({ focus_areas }) =>
    async (items: DigestItem[]): Promise<ReadableStream<string>> => {
        // Build items context with IDs for referencing
        const itemsContext = items.map(item => ({
            id: item.id,
            title: item.title,
            source: item.source_name,
            description: item.description,
            date: item.date_published,
            authors: item.authors.map(a => a.name).join(', ')
        }));

        const focusAreasText = focus_areas?.length
            ? `Focus particularly on these areas: ${focus_areas.join(', ')}.`
            : '';

        const systemPrompt = `You are a news briefing assistant. Your output will be inserted directly into an HTML document using innerHTML, so it must be valid HTML that renders correctly in a browser.

OUTPUT FORMAT: Raw HTML only (no markdown).
- Use <h2>Section Title</h2> for section headings
- Use <p>paragraph text</p> for paragraphs
- Reference articles inline as [ID] (e.g., "reported [123]")
- Do NOT use markdown syntax like ## or **bold** - these will appear as literal text
${focusAreasText}

Example of correct output:
<h2>Technology</h2>
<p>Apple announced new products [123]. Google responded [456] with strategy changes.</p>
<p>Meanwhile, Microsoft released updates [789].</p>
<h2>Politics</h2>
<p>Tensions continue [321]. New policies announced [654].</p>`;

        const stream = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(itemsContext) }
            ],
            stream: true
        });

        return new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        controller.enqueue(content);
                    }
                }
                controller.close();
            }
        });
    };
