import { OPENAI_API_KEY} from '$env/static/private';
import OpenAI from 'openai';
import type { TopicGroup, Item } from '@prisma/client';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { db } from './database';
import { is } from 'date-fns/locale';
import { get_values } from '../utils';

const openai = new OpenAI(OPENAI_API_KEY);

// Fetch the list of topics belonging to a topic group
async function fetch_topics(topic_group_title: string): Promise<String[]> {
    try {
        const topic_group = await db.topicGroup.findUniqueOrThrow({
            where: { title: topic_group_title },
            include: { topics: true }
        });
        const topics = topic_group.topics.map(topic => topic.topic);
        return topics;
    } catch (error) {
        throw new Error (`Error fetching topic group ${topic_group_title}: ${error}`);
    }
}

// todo: maybe add channel, language, etc, to help with context
async function decide_if_item_is_relevant_to_topic_group(item: { source_name?: string, title: string, description?: string }, topic_group_title: string): Promise<boolean> {
    console.log(`Checking if item ${item.title} is relevant to topic group ${topic_group_title}...`);
    const topics = await fetch_topics(topic_group_title).then((topics) => z.enum(topics));
    const response_object = z.object({
        explanation: z.string(),
        relevant_topics: z.array(topics),
        is_relevant: z.boolean()
    });
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-2024-08-06',
        messages: [
            { role: 'system', content: 'Determine if the following article is relevant to the topics.'},
            { role: 'user', content: `{ source: "${item.source_name}", title: "${item.title}", description: "${item.description}"}`}
        ],
        response_format: zodResponseFormat(response_object, 'relevance')
    });
    const response = completion.choices[0].message.content;
    // console.log(`Asked gpt-4o if ${item.title} is relevant to topic group ${topic_group_title}. Response: ${response}`);
    return JSON.parse(response).is_relevant;
}

// Update relevance of item to topic group in the database
export async function update_relevance_of_item_to_topic_group(item: Item, topic_group_title: string): Promise<void> {
    if (get_values(item.checked_relevance_to_topic_groups).includes(topic_group_title)) {
        // console.log(`Item ${item.title} has already been checked for relevance to topic group ${topic_group_title}. Skipping...`);
        return;
    }
    const is_relevant = await decide_if_item_is_relevant_to_topic_group(item, topic_group_title);
    await set_relevance_of_item_to_topic_group(item, topic_group_title, is_relevant);
}

// Set relevance of item to topic group in the database
async function set_relevance_of_item_to_topic_group(item: Item, topic_group_title: string, is_relevant: boolean): Promise<void> {
    if (is_relevant) {
        await db.item.update({
            where : { id : item.id },
            data: {
                relevant_topic_groups: {
                    connect: { title: topic_group_title }
                }
            }
        });
    } else {
        await db.item.update({
            where : { id : item.id },
            data: {
                checked_relevance_to_topic_groups: {
                    connect: { title: topic_group_title }
                }
            }
        });
    }
}