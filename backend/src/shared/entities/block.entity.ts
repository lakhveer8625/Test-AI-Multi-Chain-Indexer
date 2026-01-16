import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Chain } from './chain.entity';

@ObjectType()
@Entity('blocks')
@Index(['chain_id', 'block_number'], { unique: true })
@Index(['chain_id', 'block_hash'])
@Index(['is_canonical'])
@Index(['timestamp'])
export class Block {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    chain_id: string;

    @Field()
    @Column({ type: 'bigint' })
    block_number: string;

    @Field()
    @Column()
    block_hash: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    parent_hash: string;

    @Field()
    @Column({ type: 'timestamp' })
    timestamp: Date;

    @Field()
    @Column({ default: true })
    is_canonical: boolean;

    @Field(() => Int)
    @Column({ default: 0 })
    event_count: number;

    @Column({ type: 'json', nullable: true })
    metadata: any;

    @Field()
    @CreateDateColumn()
    indexed_at: Date;

    @Field(() => Chain)
    @ManyToOne(() => Chain)
    @JoinColumn({ name: 'chain_id', referencedColumnName: 'chain_id' })
    chain: Chain;
}
