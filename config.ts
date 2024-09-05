
import { subDays } from 'date-fns';


export const sources = 
[
    { 
        name: 'The New York Times', 
        source_class: 'NYTimesAPI'
    },
    { 
        name: 'The Atlantic', 
        source_class: 'TheAtlantic', 
        channels: ['bestof']
    },
    { 
        name: "Dan Carlin's Substack", 
        source_class: 'RSS', 
        url: 'https://dancarlin.substack.com/feed' 
    }
];

export const topic_groups = 
[
    {
        title: "2024 US Politics",
        topics: [
            "The 2024 US Presidential Election" ,
            "Donald Trump",
            "J. D. Vance",
            "Kamala Harris",
            "Tim Walz"
        ]
    },
    {
        title: "Environmental Issues",
        topics: [
            "The Environment",
            "Climate Change",
            "Global Warming",
            "Pollution",
            "Green Energy",
            "Waste Management"
        ]
    }
];

export const blocks = 
[
    {
        header: "US News Minus 2024 Presidential Election",
        prisma_query: {
            where: {
                source_name: {
                    in: ["The Atlantic", "The New York Times"]
                },
                relevant_topic_groups: {
                    none: {
                        title: "2024 US Politics"
                    }
                }
            },
            include: {
                authors: true
            },
            orderBy: {
                date_published: "desc"
            }
        }
    },
    {
        header: "Interesting articles you may have missed",
        prisma_query: {
            where: {
                source_name: {
                    in: [ "The Atlantic" ]
                },
                relevant_topic_groups: {
                    none: {
                        title: "2024 US Politics"
                    }
                },
                seen: false,
                number_of_words: {
                    gte: 2000
                },
                date_published: {
                    gte: subDays(new Date(), 7)
                },
                orderBy: {
                    number_of_words: "desc"
                }
            }
        }
    },
    {
        header: "2024 Presidential Election",
        prisma_query: {
            where: {
                source_name: {
                    in: ["The Atlantic", "The New York Times"]
                },
                relevant_topic_groups: {
                    some: {
                        title: "2024 US Politics"
                    }
                },
            },
            include: {
                authors: true
            },
            orderBy: {
                date_published: "desc"
            }
        }
    },
    {
        header: "Environmental News",
        prisma_query: {
            where: {
                relevant_topic_groups: {
                    some: {
                        title: "Environmental Issues"
                    }
                },
                source_name: {
                    in: ["The Atlantic", "The New York Times"]
                }
            },
            include: {
                authors: true
            },
            orderBy: {
                date_published: "desc"
            }
        }
    },
    {
        header: "Articles by Olga Khazan",
        prisma_query: {
            where: {
                authors: {
                    some: {
                        name: "Olga Khazan"
                    }
                }
            },
            include: {
                authors: true
            },
            orderBy: {
                date_published: "desc"
            }
        }
    },
    {
        header: "Unseen Items",
        prisma_query: {
            where: {
                seen: false
            },
            include: {
                authors: true
            },
            orderBy: {
                date_published: "desc"
            }
        }
    },
    {
        header: "Read Later",
        prisma_query: {
            where: {
                read_later: true
            },
            include: {
                authors: true
            }
        }
    },
    {
        header: "Saved items",
        prisma_query: {
            where: 
            {
                saved: true
            },
            include: 
            {
                authors: true
            }
        }
    }
]

export const feeds = 
[
    {
        title: "Saved",
        blocks: [ "Saved items" ]
    },
    {
        title: "Read Later",
        blocks: [ "Read Later" ]
    },
    {
        title: "Serious News Minus Presidential Election",
        blocks: [ "US News Minus 2024 Presidential Election", "Interesting articles you may have missed" ]
    },
    {
        title: "2024 Presidential Election",
        blocks: [ "2024 Presidential Election" ]
    },
    {
        title: "Articles by Olga Khazan",
        blocks: [ "Articles by Olga Khazan" ]
    },
    {
        title: "Environmental News",
        blocks: [ "Environmental News"]
    },
    {
        title: "Unseen Items",
        blocks: [ "Unseen Items" ]
    }
];