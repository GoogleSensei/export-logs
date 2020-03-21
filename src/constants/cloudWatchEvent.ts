/**
 * CloudWatchEventsから渡される情報
 */
export interface CloudWatchEventsRequest {
    bucketName: string;
    logGroupName: string;
}

/**
 * CloudWatchLogsのExportTaskに渡す値
 */
export interface ExportTaskRequest {
    firstTime: number;
    lastTime: number;
    currentTime: number;
}
