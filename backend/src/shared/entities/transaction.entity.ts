import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Chain } from './chain.entity';

@ObjectType()
@Entity('transactions')
@Index(['chain_id', 'tx_hash'], { unique: true })
@Index(['from_address'])
@Index(['to_address'])
@Index(['is_canonical'])
@Index(['timestamp'])
export class Transaction {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
    from_address: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    to_address: string;

    @Field()
    @Column({ type: 'varchar', length: 78 })
    value: string;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    input_data: string;

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
