import { add, subDays } from 'date-fns';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// todo: create a "config file" containing constants sources, topic_groups, feeds. Use that to seed the database and also reload it when refreshing the feeds

async function add_languages() {
    await prisma.language.createMany({
        data: [
            { id: 'en', name: 'English' },
            { id: 'no', name: 'Norwegian' }
        ]
    });
};

async function add_sources() {
    const datas = [
            { name: 'The New York Times', source_class: 'NYTimesAPI'},
            { name: 'The Atlantic', source_class: 'TheAtlantic', channels: { create: { channel_name: 'bestof' } } },
            { name: 'Hacker News', source_class: 'RSS', url: 'https://news.ycombinator.com/rss' },
            { name: "Dan Carlin's Substack", source_class: 'RSS', url: 'https://dancarlin.substack.com/feed' },
            { name: 'NRK', source_class: 'RSS', url: 'https://www.nrk.no/toppsaker.rss' },
        ]
    // Have to use a loop because createMany does not support nested create
    for (const source_data of datas) {
        await prisma.source.create({
            data: source_data
        });
    }
};

async function add_topics() {
    const datas = [
        {
            title: "Avoid these topics",
            topics: { 
                create: [
                    { topic: "The 2024 US Presidential Election" } ,
                    { topic: "Donald Trump" }
                ]
            }
        },
        {
            title: "My interests",
            topics: { 
                create: [
                    { topic: "Development and launches of SpaceX's Starship rocket" } 
                ]
            }
        }
    ]
    for (const topic_data of datas) {
        await prisma.topicGroup.create({
            data: topic_data
        });
    }
}

async function add_feeds() {
    const datas = 
    [
        {
            title: "Serious News",
            blocks: {
                create: [
                    {
                        header: "Articles in The Atlantic",
                        prisma_query: JSON.stringify({
                            take: 10,
                            where: {
                                source_name: "The Atlantic",
                                relevant_topic_groups: {
                                    none: {
                                        title: "Avoid these topics"
                                    }
                                },
                            },
                            include: {
                                authors: true
                            },
                            orderBy: {
                                date_published: "desc"
                            }
                        }),
                        contains_sources: { connect: [ { name: "The Atlantic" } ] },
                        contains_topic_groups: { connect: [ { title: "Avoid these topics" } ] }
                    },
                    {
                        header: "More articles",
                        prisma_query: JSON.stringify({
                            where: {
                                source_name: {
                                    in: ["The New York Times", "NRK"]
                                },
                                seen: false,
                                date_published: {
                                    gt: subDays(new Date(), 1) // only show articles from the last day
                                }
                            },
                            include: {
                                authors: true
                            },
                            orderBy: {
                                date_published: "desc"
                            }
                        }),
                        contains_sources: { connect: [ { name: "The New York Times" }, { name: "NRK" } ] }
                    }
                ]
            }
        },
        {
            title: "Tech News",
            blocks: {
                create: [
                    {
                        header: "Hacker News",
                        prisma_query: JSON.stringify({
                            where: {
                                source_name: "Hacker News",
                                date_published: {
                                    gt: subDays(new Date(), 1) // only show articles from the last day
                                }
                            },
                            orderBy: {
                                date_published: "desc"
                            }
                        }),
                        contains_sources: { connect: [ { name: "Hacker News" } ] }
                    }
                ]
            }
        },
        {
            title: "All Unseen Items",
            blocks: {
                create: [
                    {
                        header: "Unseen Items",
                        prisma_query: JSON.stringify({
                            where: {
                                seen: false
                            },
                            include: {
                                authors: true
                            },
                            orderBy: {
                                date_published: "desc"
                            }
                        }),
                        contains_sources: { connect: [ { name: "The New York Times" }, { name: "The Atlantic" }, { name: "Hacker News" }, { name: "Dan Carlin's Substack" }, { name: "NRK" } ] } // todo: better way to include all?
                    }
                ]
            }
        },
        {
            title: "Read Later",
            blocks: {
                create: [
                    {
                        header: "Read Later",
                        prisma_query: JSON.stringify({
                            where: {
                                read_later: true
                            },
                            include: {
                                authors: true
                            }
                        }),
                        contains_sources: { connect: [ { name: "The New York Times" }, { name: "The Atlantic" }, { name: "Hacker News" }, { name: "Dan Carlin's Substack" }, { name: "NRK" } ] } // todo: better way to include all?
                    }
                ]
            }
        },
        {
            title: "Favorites",
            blocks: {
                create: [
                    {
                        header: "Favorites",
                        prisma_query: 
                        JSON.stringify({
                            where: 
                            {
                                saved: true
                            },
                            include: 
                            {
                                authors: true
                            }
                        }),
                        contains_sources: { connect: [ { name: "The New York Times" }, { name: "The Atlantic" }, { name: "Hacker News" }, { name: "Dan Carlin's Substack" }, { name: "NRK" } ] } // todo: better way to include all?
                    }
                ]
            }
        }
    ];
    for (const feed_data of datas) {
        await prisma.feed.create({
            data: feed_data
        });
    }
}

async function main() {
    await add_languages();
    await add_sources();
    await add_topics();
    await add_feeds();
    await prisma.$disconnect();
};

main().catch((e) => {console.error(e); process.exit(1)});