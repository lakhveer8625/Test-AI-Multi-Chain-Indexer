import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('chains')
export class Chain {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ unique: true })
    chain_id: string;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column()
    type: string; // 'evm', 'solana', 'cosmos', etc.

    @Field()
    @Column()
    rpc_url: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    ws_url: string;

    @Field()
    @Column({ default: true })
    is_active: boolean;

    @Field(() => Int)
    @Column({ default: 12 })
    confirmation_depth: number;

    @Field()
    @Column({ type: 'bigint', default: 0 })
    latest_indexed_block: string;

    @Column({ type: 'json', nullable: true })
    metadata: any;

    @Field()
    @CreateDateColumn()
    created_at: Date;
}
