import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
            { name: 'The New York Times', source_type: 'NYTimesAPI'},
            { name: 'The Atlantic', source_type: 'TheAtlantic', channels: { create: { channel_name: 'bestof' } } },
            { name: 'Hacker News', source_type: 'RSS', url: 'https://news.ycombinator.com/rss' },
            { name: "Dan Carlin's Substack", source_type: 'RSS', url: 'https://dancarlin.substack.com/feed' }
        ]
    // Have to use a loop because createMany does not support nested create
    for (const source_data of datas) {
        await prisma.source.create({
            data: source_data
        });
    }
};

async function main() {
    await add_languages();
    await add_sources();
    await prisma.$disconnect();
};

main().catch((e) => {console.error(e); process.exit(1)});