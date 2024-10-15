export abstract class NotificationMessage {
    abstract build(parameters: any): Promise<string>; 
}
