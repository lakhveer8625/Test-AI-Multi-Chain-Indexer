import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
    // Get RPC URLs from environment variables with fallback defaults
    const ETH_MAINNET_RPC = process.env.ETH_MAINNET_RPC_URL || 'https://rpc.ankr.com/eth';
    const ETH_SEPOLIA_RPC = process.env.ETH_SEPOLIA_RPC_URL || 'https://rpc.ankr.com/eth_sepolia';
    const SOLANA_MAINNET_RPC = process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';

    console.log('Seeding database with chain configurations...');

    // 1. Ethereum Mainnet
    await prisma.chain.upsert({
        where: { chainId: 1 },
        update: { rpcUrl: ETH_MAINNET_RPC },
        create: {
            chainId: 1,
            name: 'Ethereum Mainnet',
            rpcUrl: ETH_MAINNET_RPC,
            type: 'EVM'
        },
    });
    console.log(`✓ Ethereum Mainnet configured with RPC: ${ETH_MAINNET_RPC}`);

    // 2. Sepolia
    await prisma.chain.upsert({
        where: { chainId: 11155111 },
        update: { rpcUrl: ETH_SEPOLIA_RPC },
        create: {
            chainId: 11155111,
            name: 'Sepolia',
            rpcUrl: ETH_SEPOLIA_RPC,
            type: 'EVM'
        },
    });
    console.log(`✓ Sepolia configured with RPC: ${ETH_SEPOLIA_RPC}`);

    // 3. Solana (Optional - only if needed)
    if (process.env.ENABLE_SOLANA === 'true') {
        await prisma.chain.upsert({
            where: { chainId: 101 },
            update: { rpcUrl: SOLANA_MAINNET_RPC },
            create: {
                chainId: 101,
                name: 'Solana Mainnet',
                rpcUrl: SOLANA_MAINNET_RPC,
                type: 'SOLANA'
            },
        });
        console.log(`✓ Solana Mainnet configured with RPC: ${SOLANA_MAINNET_RPC}`);
    }

    console.log('\n✅ Seeding completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
