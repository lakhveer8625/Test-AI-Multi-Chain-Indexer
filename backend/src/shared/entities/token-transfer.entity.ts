import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('token_transfers')
@Index(['chain_id', 'token_address'])
@Index(['from_address'])
@Index(['to_address'])
@Index(['is_canonical'])
@Index(['timestamp'])
export class TokenTransfer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    event_id: string;

    @Column()
    chain_id: string;

    @Column({ type: 'bigint' })
    block_number: string;

    @Column()
    tx_hash: string;

    @Column()
    token_address: string;

    @Column()
    token_type: string; // 'ERC20', 'ERC721', 'ERC1155'

    @Column()
    from_address: string;

    @Column()
    to_address: string;

    @Column({ type: 'varchar', length: 78 })
    amount: string;

    @Column({ nullable: true })
    token_id: string; // For NFTs

    @Column({ default: true })
    is_canonical: boolean;

    @Column({ type: 'timestamp' })
    timestamp: Date;

    @CreateDateColumn()
    indexed_at: Date;
}
