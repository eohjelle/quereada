import { db } from '$lib/server/database';
import { sources, topic_groups, blocks, feeds } from '../../../config';
import { get_values } from '$lib/utils';

export async function load_config(): Promise<void> {
    // Upsert sources with channels
    await Promise.all(sources.map(async (source) => {
        const source_data = {
             name: source.name,
             source_class: source.source_class,
             url: source.url || undefined,
             channels: {
                connectOrCreate:
                    source.channels ? source.channels.map(channel => ({ 
                        where: { source_name_channel_name: { source_name: source.name, channel_name: channel } }, 
                        create: { channel_name: channel } 
                    })) : []
             }
        };
        await db.source.upsert({
            where: { name: source.name },
            update: source_data,
            create: source_data
        });
    }));

    // Upsert topics
    await Promise.all(topic_groups.map(async (topic_group) => {
        const topic_group_data = {
            title: topic_group.title,
            topics: {
                connectOrCreate: topic_group.topics.map(topic => ({ 
                    where: { topic: topic }, 
                    create: { topic: topic } 
                }))
            }
        };
        await db.topicGroup.upsert({
            where: { title: topic_group.title },
            update: topic_group_data,
            create: topic_group_data
        });
    }));

    // Finally, set blocks and feeds. We're not using Promise.all because we want the blocks and feeds to appear in the database in the order they are defined in the config.
    for (const block of blocks) {
        const contains_sources = block.prisma_query.where?.source_name ? // todo: Fix this to get the right array in case of keywords "notIn" or no keyword
            get_values(block.prisma_query.where.source_name).map(source => ({ name: source })) : [];
        const contains_topic_groups = block.prisma_query.where?.relevant_topic_groups ? 
            get_values(block.prisma_query.where.relevant_topic_groups).map(topic_group => ({ title: topic_group })) : [];
        await db.feedBlock.upsert({
            where: { header: block.header },
            update: {
                header: block.header,
                prisma_query: JSON.stringify(block.prisma_query),
                contains_sources: { set: contains_sources },
                contains_topic_groups: { set: contains_topic_groups },
                occurs_in_feed: { set: [] } // we will connect feeds later
            },
            create: {
                header: block.header,
                prisma_query: JSON.stringify(block.prisma_query),
                contains_sources: { connect: contains_sources },
                contains_topic_groups: { connect: contains_topic_groups }
            }
        });
    };

    // Set feeds.
    for (const feed of feeds) {
        const contains_blocks = feed.blocks.map(block => ({ header: block }));
        await db.feed.upsert({
            where: { title: feed.title },
            update: {
                title: feed.title,
                blocks: { set: contains_blocks }
            },
            create: {
                title: feed.title,
                blocks: { connect: contains_blocks }
            }
        })
    };

    // Remove unused feeds and blocks
    await db.feed.deleteMany({
        where: {
            title: { notIn: feeds.map(feed => feed.title) }
        }
    });
    await db.feedBlock.deleteMany({
        where: {
            header: { notIn: blocks.map(block => block.header) }
        }
    });
}