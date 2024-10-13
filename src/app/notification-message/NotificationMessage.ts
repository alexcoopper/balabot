export abstract class NotificationMessage {
    abstract build(): Promise<string>; 
}
