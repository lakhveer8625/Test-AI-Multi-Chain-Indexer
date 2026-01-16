import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('raw_events')
@Index(['chain_id', 'block_number', 'log_index'], { unique: true })
@Index(['chain_id', 'tx_hash'])
@Index(['contract_address'])
@Index(['is_canonical'])
export class RawEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    chain_id: string;

    @Column({ type: 'bigint' })
    block_number: string;

    @Column()
    block_hash: string;

    @Column()
    tx_hash: string;

    @Column()
    log_index: number;

    @Column()
    contract_address: string;

    @Column({ type: 'text' })
    topics: string; // JSON array

    @Column({ type: 'text' })
    data: string;

    @Column({ default: true })
    is_canonical: boolean;

    @Column({ default: false })
    is_processed: boolean;

    @Column({ type: 'timestamp' })
    block_timestamp: Date;

    @CreateDateColumn()
    indexed_at: Date;
}
