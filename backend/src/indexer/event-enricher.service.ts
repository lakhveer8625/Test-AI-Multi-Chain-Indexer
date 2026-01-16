import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../shared/entities/contract.entity';

@Injectable()
export class EventEnricherService {
    private readonly logger = new Logger(EventEnricherService.name);

    constructor(
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
    ) { }

    async enrich(normalizedEvent: any): Promise<any> {
        // Add contract metadata if available
        const contract = await this.contractRepository.findOne({
            where: {
                chain_id: normalizedEvent.chain_id,
                address: normalizedEvent.contract_address,
            },
        });

        if (contract) {
            normalizedEvent.decoded_data = {
                ...normalizedEvent.decoded_data,
                contract_name: contract.name,
                contract_symbol: contract.symbol,
                contract_type: contract.contract_type,
            };
        }

        return normalizedEvent;
    }
}
