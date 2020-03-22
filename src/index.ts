import * as aws from 'aws-sdk';
import { Context, Callback } from 'aws-lambda';
import { CloudWatchEventsRequest, ExportTaskRequest } from './constants/cloudWatchEvent';
import { CloudWatchLogs } from 'aws-sdk';

aws.config.update({ region: 'ap-northeast-1' });

/**
 * メイン処理
 * @param event : 呼び出し元サービスから渡される値
 * @param context : AWS側の各種情報
 * @param callback : 呼び出し元サービスへ返す値
 * test
 */
exports.handler = (event: CloudWatchEventsRequest, context: Context, callback: Callback) => {
    console.log(`event: ${event}`);
    console.log(`event: ${context}`);
    console.log(`event: ${callback}`);

    // eventからS3bucketと対象のロググループ名を抜き出す
    const { bucketName } = event;
    const { logGroupName } = event;

    const cloudwatchlogs = new aws.CloudWatchLogs;
    console.log(`先月の${logGroupName}のログを${bucketName}へ移行を開始します。`);
    const requestData: ExportTaskRequest = getTimeData();

    /*
   "destination"で設定したS3バケットに、"destinationPrefix"で設定したフォルダを作り、
   "logGroupName"で設定したCludWatchのロググループのlogをexportする。
   exportするlogの範囲は、"from"から"to"で設定した範囲。
  */
    const params: aws.CloudWatchLogs.CreateExportTaskRequest = {
        taskName: `${process.env.TaskName}/${requestData.currentTime}`,
        logGroupName,
        from: requestData.firstTime, // 肩を揃える必要がある
        to: requestData.lastTime,
        destination: bucketName,
        destinationPrefix: `${process.env.DestinationPrefix}/${requestData.currentTime}`,
    };

    console.log(JSON.stringify(params));

    /* logのexport処理 */
     cloudwatchlogs.createExportTask(
         params,
         (err: aws.AWSError, data: aws.CloudWatchLogs.Types.CreateExportTaskResponse) => {
             if (err) {
                 console.log(err, err.stack);
                 callback(null, err.stack);
             } else {
                 console.log(data);
             }
             callback(null, data);
         }
     );
};

/**
 * ログ取得の開始日時、終了日時、日付フォーマットを返す。
 * ログデータは、エクスポートできるようになるまで最大 12時間かかる場合があるので、
 * 先月のログを取得するように日時を調整。
 * @return arr : [from, to, format]
 *
 */

// function getTimeData() {
//     console.log('対象の日付を抽出します。');
//     const arr = [];
//     const fulldate = new Date();
//     const year = fulldate.getFullYear();
//     const month = fulldate.getMonth();

//     // 先月の1日と最終日を作成
//     const firstDayOfLastMonth = new Date(year, month - 1, 1);
//     const lastDayOfLastMonth = new Date(year, month, 0);

//     lastDayOfLastMonth.setHours(23);
//     lastDayOfLastMonth.setMinutes(59);
//     lastDayOfLastMonth.setSeconds(59);
//     lastDayOfLastMonth.setMilliseconds(999);

//     console.log(firstDayOfLastMonth);
//     console.log(lastDayOfLastMonth);

//     arr.push(firstDayOfLastMonth.getTime(), lastDayOfLastMonth.getTime(), fulldate);

//     return arr;
// }

function getTimeData() {
    console.log('対象の日付を抽出します。');
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 先月の1日と最終日を作成
    const firstDate = new Date(year, month - 1, 1);
    const lastDate = new Date(year, month, 0);

    lastDate.setHours(23);
    lastDate.setMinutes(59);
    lastDate.setSeconds(59);
    lastDate.setMilliseconds(999);

    console.log(firstDate);
    console.log(lastDate);

    // exchange date to time
    const firstTime = firstDate.getTime();
    const lastTime = lastDate.getTime();
    const currentTime = firstDate.getTime();

    const data: ExportTaskRequest = {
        firstTime,
        lastTime,
        currentTime,
    };

    return data;
}
