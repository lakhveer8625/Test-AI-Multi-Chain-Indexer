import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chain } from '../../shared/entities/chain.entity';

@ApiTags('chains')
@Controller('api/chains')
export class ChainController {
    constructor(
        @InjectRepository(Chain)
        private chainRepository: Repository<Chain>,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get all supported chains' })
    async getChains() {
        return this.chainRepository.find({ where: { is_active: true } });
    }

    @Get(':chainId')
    @ApiOperation({ summary: 'Get chain by ID' })
    async getChain(@Param('chainId') chainId: string) {
        return this.chainRepository.findOne({ where: { chain_id: chainId } });
    }
}
