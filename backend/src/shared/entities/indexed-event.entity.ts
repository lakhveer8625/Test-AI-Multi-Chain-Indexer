import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Chain } from './chain.entity';

@ObjectType()
@Entity('indexed_events')
@Index(['chain_id', 'event_type'])
@Index(['from_address'])
@Index(['to_address'])
@Index(['contract_address'])
@Index(['is_canonical'])
@Index(['timestamp'])
export class IndexedEvent {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    raw_event_id: string;

    @Field()
    @Column()
    chain_id: string;

    @Field()
    @Column({ type: 'bigint' })
    block_number: string;

    @Field()
    @Column()
    tx_hash: string;

    @Field()
    @Column()
    event_type: string; // 'Transfer', 'Approval', 'Swap', etc.

    @Field()
    @Column()
    contract_address: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    from_address: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    to_address: string;

    @Field({ nullable: true })
    @Column({ type: 'varchar', length: 78, nullable: true })
    value: string;

    @Column({ type: 'json', nullable: true })
    decoded_data: any;

    @Field()
    @Column({ default: true })
    is_canonical: boolean;

    @Field()
    @Column({ type: 'timestamp' })
    timestamp: Date;

    @Field()
    @CreateDateColumn()
    indexed_at: Date;

    @ManyToOne(() => Chain)
    @JoinColumn({ name: 'chain_id', referencedColumnName: 'chain_id' })
    chain: Chain;
}
