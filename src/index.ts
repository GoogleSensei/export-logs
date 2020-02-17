import * as aws from 'aws-sdk';
import { Context, Callback } from 'aws-lambda';

aws.config.update({ region: 'ap-northeast-1' });

/**
 * メイン処理
 * @param event : 呼び出し元サービスから渡される値
 * @param context : AWS側の各種情報
 * @param callback : 呼び出し元サービスへ返す値
 * test
 */
exports.handler = (event: any, context: Context, callback: Callback) => {
    console.log(`event: ${event}`);
    console.log(`event: ${context}`);
    console.log(`event: ${callback}`);

    const cloudwatchlogs: object = new aws.CloudWatchLogs();
    // eventからS3bucketと対象のロググループ名を抜き出す
    const { bucketName } = event;
    const { logGroupName } = event;

    console.log(`先月の${logGroupName}のログを${bucketName}へ移行を開始します。`);
    const getToTime = getTimeData();

    /*
   "destination"で設定したS3バケットに、"destinationPrefix"で設定したフォルダを作り、
   "logGroupName"で設定したCludWatchのロググループのlogをexportする。
   exportするlogの範囲は、"from"から"to"で設定した範囲。
  */
    const params: aws.CloudWatchLogs.CreateExportTaskRequest = {
        taskName: `${process.env.TaskName}/${getToTime[2]}`,
        logGroupName,
        from: getToTime[0],
        to: getToTime[1],
        destination: bucketName,
        destinationPrefix: `${process.env.DestinationPrefix}/${getToTime[2]}`,
    };

    console.log(JSON.stringify(params));

    /* logのexport処理 */
    aws.CloudWatchLogs.CreateExportTask(
        params,
        (err: aws.AWSError, data: aws.CloudWatchLogs.Types.CreateExportTaskResponse) => {
            if (err) {
                console.log(err, err.stack);
                callback(null, err.stack);
            } else {
                console.log(data);
                this.response = data;
            }
            callback(null, response);
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

function getTimeData() {
    console.log('対象の日付を抽出します。');
    const arr = [];
    const fulldate = new Date();
    const year = fulldate.getFullYear();
    const month = fulldate.getMonth();

    // 先月の1日と最終日を作成
    const firstDayOfLastMonth = new Date(year, month - 1, 1);
    const lastDayOfLastMonth = new Date(year, month, 0);

    lastDayOfLastMonth.setHours(23);
    lastDayOfLastMonth.setMinutes(59);
    lastDayOfLastMonth.setSeconds(59);
    lastDayOfLastMonth.setMilliseconds(999);

    console.log(firstDayOfLastMonth);
    console.log(lastDayOfLastMonth);

    arr.push(firstDayOfLastMonth.getTime(), lastDayOfLastMonth.getTime(), fulldate);

    return arr;
}
