import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('contracts')
@Index(['chain_id', 'address'], { unique: true })
@Index(['contract_type'])
export class Contract {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chain_id: string;

    @Column()
    address: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    symbol: string;

    @Column({ nullable: true })
    contract_type: string; // 'ERC20', 'ERC721', 'ERC1155', etc.

    @Column({ type: 'text', nullable: true })
    abi: string;

    @Column({ default: true })
    is_verified: boolean;

    @Column({ type: 'json', nullable: true })
    metadata: any;

    @CreateDateColumn()
    created_at: Date;
}
