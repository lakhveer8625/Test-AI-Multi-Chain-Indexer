import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.chain.update({
        where: { chainId: 11155111 },
        data: {
            rpcUrl: 'https://sepolia.drpc.org',
        },
    });
    console.log('Updated Sepolia RPC URL.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
