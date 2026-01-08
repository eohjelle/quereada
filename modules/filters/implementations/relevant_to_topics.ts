import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { FilterConstructor, FilterItem } from '../index';

const openai = new OpenAI();

// todo: maybe add channel, language, etc, to help with context
export const RelevantToTopics: FilterConstructor<{ topics: string[] }> = ({ topics }) => async (item: FilterItem) => {
    const topicsEnum = z.enum(topics as [string, ...string[]]);
    const response_object = z.object({
        relevant_topics: z.array(topicsEnum)
    });
    const itemToPrompt = {
        source: item.source_name,
        title: item.title,
        description: item.description
    };
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-5-nano',
        messages: [
            { role: 'system', content: 'Determine if the following article is relevant to the topics.'},
            { role: 'user', content: JSON.stringify(itemToPrompt)}
        ],
        response_format: zodResponseFormat(response_object, 'relevance')
    }, {
        timeout: 7000
    });

    const response = completion.choices[0].message.content;
    if (!response) {
        throw new Error(`Attempt to decide if item ${item.title} is relevant to topics ${topics} failed`);
    }
    return JSON.parse(response).relevant_topics.length > 0;
}


