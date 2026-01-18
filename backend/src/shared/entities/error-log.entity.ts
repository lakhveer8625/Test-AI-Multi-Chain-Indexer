import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('error_logs')
export class ErrorLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    level: string; // 'error', 'warn', etc.

    @Column()
    @Index()
    source: string; // Context, e.g., 'AllExceptionsFilter', 'IndexerService'

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'text', nullable: true })
    stack_trace: string;

    @Column({ type: 'json', nullable: true })
    metadata: any;

    @CreateDateColumn()
    @Index()
    timestamp: Date;
}
