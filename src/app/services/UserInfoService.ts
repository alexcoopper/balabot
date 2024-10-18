export type UserInfo = {
    name: string;
    sex: string;
};

export class UserInfoService {
    private static usersMap: Map<number, UserInfo> = new Map();

    static initialize() {
        const usersMapEnv = process.env.USERS_MAP || '';
        const userEntries = usersMapEnv.split(',');
        
        userEntries.forEach(entry => {
            const [userId, name, sex] = entry.split(':');
            if (userId && name && sex) {
                this.usersMap.set(parseInt(userId), { name, sex });
            }
        });
    }

    // Method to get user information by userId
    static getInfo(userId: number): UserInfo | undefined {
        return this.usersMap.get(userId);
    }
}

// Call initialize once when your application starts
UserInfoService.initialize();
