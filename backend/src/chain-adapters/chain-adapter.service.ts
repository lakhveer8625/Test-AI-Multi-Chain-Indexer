import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChainAdapter } from './adapter.interface';
import { EvmAdapter } from './evm/evm.adapter';
import { SolanaAdapter } from './solana/solana.adapter';
import { Chain } from '../shared/entities/chain.entity';

@Injectable()
export class ChainAdapterService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ChainAdapterService.name);
    private adapters: Map<string, ChainAdapter> = new Map();

    constructor(
        private configService: ConfigService,
        @InjectRepository(Chain)
        private chainRepository: Repository<Chain>,
    ) { }

    async onModuleInit() {
        await this.initializeAdapters();
    }

    async onModuleDestroy() {
        await this.stopAllAdapters();
    }

    private async initializeAdapters() {
        this.logger.log('Initializing chain adapters...');

        // Initialize EVM chains
        await this.initializeEvmChain('eth-mainnet', 'Ethereum Mainnet', '1');
        await this.initializeEvmChain('eth-sepolia', 'Ethereum Sepolia', '11155111');
        await this.initializeEvmChain('bsc-mainnet', 'BSC Mainnet', '56');
        await this.initializeEvmChain('polygon-mainnet', 'Polygon Mainnet', '137');

        // Initialize Solana chains
        await this.initializeSolanaChain('solana-mainnet', 'Solana Mainnet');
        await this.initializeSolanaChain('solana-devnet', 'Solana Devnet');

        this.logger.log(`Initialized ${this.adapters.size} chain adapters`);
    }

    private async initializeEvmChain(configKey: string, name: string, chainId: string) {
        const rpcUrl = this.configService.get(`${configKey.toUpperCase().replace(/-/g, '_')}_RPC`);

        if (!rpcUrl) {
            this.logger.warn(`RPC URL not configured for ${name}, skipping`);
            return;
        }

        try {
            const adapter = new EvmAdapter(this.configService, {
                chainId,
                chainName: name,
                rpcUrl,
            });

            await adapter.start();
            this.adapters.set(chainId, adapter);

            // Ensure chain exists in database
            await this.ensureChainExists(chainId, name, 'evm', rpcUrl);

            this.logger.log(`✓ Initialized ${name} adapter`);
        } catch (error) {
            this.logger.error(`Failed to initialize ${name}: ${error.message}`);
        }
    }

    private async initializeSolanaChain(configKey: string, name: string) {
        const rpcUrl = this.configService.get(`${configKey.toUpperCase().replace(/-/g, '_')}_RPC`);

        if (!rpcUrl) {
            this.logger.warn(`RPC URL not configured for ${name}, skipping`);
            return;
        }

        try {
            const chainId = `solana-${configKey.split('-')[1]}`;
            const adapter = new SolanaAdapter(this.configService, {
                chainId,
                rpcUrl,
            });

            await adapter.start();
            this.adapters.set(chainId, adapter);

            // Ensure chain exists in database
            await this.ensureChainExists(chainId, name, 'solana', rpcUrl);

            this.logger.log(`✓ Initialized ${name} adapter`);
        } catch (error) {
            this.logger.error(`Failed to initialize ${name}: ${error.message}`);
        }
    }

    private async ensureChainExists(chainId: string, name: string, type: string, rpcUrl: string) {
        const existing = await this.chainRepository.findOne({ where: { chain_id: chainId } });

        if (!existing) {
            await this.chainRepository.save({
                chain_id: chainId,
                name,
                type,
                rpc_url: rpcUrl,
                is_active: true,
            });
        }
    }

    getAdapter(chainId: string): ChainAdapter | undefined {
        return this.adapters.get(chainId);
    }

    getAllAdapters(): Map<string, ChainAdapter> {
        return this.adapters;
    }

    async stopAllAdapters() {
        this.logger.log('Stopping all chain adapters...');

        for (const [chainId, adapter] of this.adapters.entries()) {
            try {
                await adapter.stop();
                this.logger.log(`✓ Stopped adapter for chain ${chainId}`);
            } catch (error) {
                this.logger.error(`Failed to stop adapter for chain ${chainId}: ${error.message}`);
            }
        }
    }
}
