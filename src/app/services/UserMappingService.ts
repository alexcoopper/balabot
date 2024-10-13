import { ExpenseOwner } from '../models';

export class UserMappingService {
    private userMapping: { [userId: number]: ExpenseOwner } = {};

    constructor() {
        const authorizedUsers = process.env.AUTHORIZED_USERS;

        if (!authorizedUsers) {
            throw new Error('Environment variable AUTHORIZED_USERS is not set.');
        }

        this.userMapping = this.parseAuthorizedUsers(authorizedUsers);
    }

    private parseAuthorizedUsers(authorizedUsers: string): { [userId: number]: ExpenseOwner } {
        const userMapping: { [userId: number]: ExpenseOwner } = {};

        const pairs = authorizedUsers.split(',');
        pairs.forEach((pair) => {
            const [userId, owner] = pair.split(':');
            if (userId && owner && (owner === ExpenseOwner.Oleksii || owner === ExpenseOwner.Dmytro)) {
                userMapping[parseInt(userId, 10)] = owner;
            } else {
                console.warn(`Invalid userId:owner pair detected in AUTHORIZED_USERS: ${pair}`);
            }
        });

        return userMapping;
    }

    public getOwnerByUserId(userId: number): ExpenseOwner | undefined {
        return this.userMapping[userId];
    }

    public getAllUsers(): number[] {
        return Object.keys(this.userMapping).map((userId) => parseInt(userId, 10));
    }
}
