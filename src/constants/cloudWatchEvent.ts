/**
 * CloudWatchEventsから渡される情報
 */

export interface CloudWatchEventsRequest {
    bucketName: string;
    logGroupName: string;
}
