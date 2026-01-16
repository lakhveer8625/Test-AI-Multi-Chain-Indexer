import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { RawEvent } from '../shared/entities/raw-event.entity';

@Injectable()
export class EventNormalizerService {
    private readonly logger = new Logger(EventNormalizerService.name);

    // Common ERC20 Transfer event signature
    private readonly TRANSFER_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    // Common ERC20 Approval event signature
    private readonly APPROVAL_SIGNATURE = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

    async normalize(rawEvent: RawEvent): Promise<any | null> {
        try {
            const topics = JSON.parse(rawEvent.topics);

            if (topics.length === 0) {
                return null;
            }

            const eventSignature = topics[0];

            // Detect event type based on signature
            if (eventSignature === this.TRANSFER_SIGNATURE) {
                return this.normalizeTransferEvent(rawEvent, topics);
            } else if (eventSignature === this.APPROVAL_SIGNATURE) {
                return this.normalizeApprovalEvent(rawEvent, topics);
            }

            // Generic event
            return this.normalizeGenericEvent(rawEvent, topics);
        } catch (error) {
            this.logger.warn(`Failed to normalize event ${rawEvent.id}: ${error.message}`);
            return null;
        }
    }

    private normalizeTransferEvent(rawEvent: RawEvent, topics: string[]): any {
        // ERC20/ERC721 Transfer(address indexed from, address indexed to, uint256 value/tokenId)
        const from = topics[1] ? this.decodeAddress(topics[1]) : null;
        const to = topics[2] ? this.decodeAddress(topics[2]) : null;

        // Decode value from data
        let value = '0';
        try {
            if (rawEvent.data && rawEvent.data !== '0x') {
                value = BigInt(rawEvent.data).toString();
            } else if (topics[3]) {
                // ERC721 - tokenId in topics
                value = BigInt(topics[3]).toString();
            }
        } catch (error) {
            this.logger.warn(`Failed to decode value: ${error.message}`);
        }

        return {
            raw_event_id: rawEvent.id,
            chain_id: rawEvent.chain_id,
            block_number: rawEvent.block_number,
            tx_hash: rawEvent.tx_hash,
            event_type: 'Transfer',
            contract_address: rawEvent.contract_address,
            from_address: from,
            to_address: to,
            value,
            decoded_data: { from, to, value },
            is_canonical: rawEvent.is_canonical,
            timestamp: rawEvent.block_timestamp,
        };
    }

    private normalizeApprovalEvent(rawEvent: RawEvent, topics: string[]): any {
        const owner = topics[1] ? this.decodeAddress(topics[1]) : null;
        const spender = topics[2] ? this.decodeAddress(topics[2]) : null;

        let value = '0';
        try {
            if (rawEvent.data && rawEvent.data !== '0x') {
                value = BigInt(rawEvent.data).toString();
            }
        } catch (error) {
            this.logger.warn(`Failed to decode approval value: ${error.message}`);
        }

        return {
            raw_event_id: rawEvent.id,
            chain_id: rawEvent.chain_id,
            block_number: rawEvent.block_number,
            tx_hash: rawEvent.tx_hash,
            event_type: 'Approval',
            contract_address: rawEvent.contract_address,
            from_address: owner,
            to_address: spender,
            value,
            decoded_data: { owner, spender, value },
            is_canonical: rawEvent.is_canonical,
            timestamp: rawEvent.block_timestamp,
        };
    }

    private normalizeGenericEvent(rawEvent: RawEvent, topics: string[]): any {
        return {
            raw_event_id: rawEvent.id,
            chain_id: rawEvent.chain_id,
            block_number: rawEvent.block_number,
            tx_hash: rawEvent.tx_hash,
            event_type: 'Unknown',
            contract_address: rawEvent.contract_address,
            from_address: null,
            to_address: null,
            value: null,
            decoded_data: { topics, data: rawEvent.data },
            is_canonical: rawEvent.is_canonical,
            timestamp: rawEvent.block_timestamp,
        };
    }

    private decodeAddress(topic: string): string {
        // Remove topic padding to get address
        return '0x' + topic.slice(-40);
    }
}
