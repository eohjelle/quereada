import OpenAI from 'openai';
import type { DisplayItem } from '$lib/types';
import type { DigesterConstructor, BlockOutput } from '../index';
import { collectItems, toDigestItems } from '../utils';

const openai = new OpenAI();

const DEFAULT_MODEL = 'gpt-5-mini';

/**
 * Collects all text content from a content stream.
 */
async function collectContent(stream: ReadableStream<string>): Promise<string> {
    const chunks: string[] = [];
    const reader = stream.getReader();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }

    return chunks.join('');
}

/**
 * LLMDigest: A generic LLM-based digester that accepts a configurable prompt.
 *
 * The output references items using [ID] syntax, which the frontend
 * parses into clickable links that expand to show the full item.
 *
 * @param prompt - The system prompt defining the digest style/content
 * @param model - The LLM model to use (defaults to gpt-5-mini)
 */
export const LLMDigest: DigesterConstructor<{ prompt: string; model?: string }> = ({ prompt, model }) => {
    if (!prompt) {
        throw new Error('LLMDigest requires a "prompt" argument');
    }

    return async (inputs: BlockOutput[]): Promise<ReadableStream<string>> => {
        // Collect items and content from all input blocks
        const allDisplayItems: DisplayItem[] = [];
        const upstreamContent: string[] = [];

        for (const input of inputs) {
            if (input.type === 'items') {
                // Collect items from item stream
                const displayItems = await collectItems(input.stream);
                allDisplayItems.push(...displayItems);
            } else {
                // Collect content from upstream digester
                const content = await collectContent(input.stream);
                upstreamContent.push(content);
            }
        }

        // Fetch additional fields if needed (like content for summarization)
        const items = await toDigestItems(allDisplayItems);

        // Build items context with IDs for referencing
        const itemsContext = items.map(item => ({
            id: item.id,
            title: item.title,
            source: item.source_name,
            description: item.description,
            date: item.date_published,
            authors: item.authors.map(a => a.name).join(', ')
        }));

        // Build the full system prompt with formatting instructions
        const systemPrompt = `${prompt}

OUTPUT FORMAT: Use markdown formatting.
- Use ## for section headings
- Use standard markdown for emphasis, lists, etc.
- Reference articles inline as [ID] (e.g., "reported [123]")`;

        // Build user message with items and any upstream content
        let userContent = '';
        if (upstreamContent.length > 0) {
            userContent += 'Previous content to incorporate:\n\n';
            userContent += upstreamContent.join('\n\n---\n\n');
            userContent += '\n\n---\n\nAdditional items:\n\n';
        }
        userContent += JSON.stringify(itemsContext);

        const stream = await openai.chat.completions.create({
            model: model || DEFAULT_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
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
};
