import * as aws from 'aws-sdk';

aws.config.update({ region: 'ap-northeast-1' });

/**
 * メイン処理
 * @param event : 呼び出し元サービスから渡される値
 * @param context : AWS側の各種情報
 * @param callback : 呼び出し元サービスへ返す値
 *
 */
exports.handler = (event: object, context, callback) => {
    const cloudwatchlogs: any = new aws.CloudWatchLogs();
    const BucketName: string = event;
    const { LogGroupName } = event;
    const response:
    let params;　
    let getToTime = [];
    console.log(`先月の${LogGroupName}のログを${BucketName}へ移行を開始します。`);
    getToTime = getTimeData();

    /*
   "destination"で設定したS3バケットに、"destinationPrefix"で設定したフォルダを作り、
   "logGroupName"で設定したCludWatchのロググループのlogをexportする。
   exportするlogの範囲は、"from"から"to"で設定した範囲。
  */
    params = {
        'destination': BucketName,
        'from': getToTime[0],
        'to': getToTime[1],
        'logGroupName': LogGroupName,
        'destinationPrefix': `${process.env.DestinationPrefix}/${getToTime[2]}`,
        'taskName': `${process.env.TaskName}/${getToTime[2]}`,
    };

    console.log(JSON.stringify(params));

    /* logのexport処理 */
    cloudwatchlogs.createExportTask(params, (err: error, data: object) => {
        var response: object;
        if (err) {
            console.log(err, err.stack);
            callback(null, err.stack);
        } else {
            console.log(data);
            response = data;
        }
        callback(null, response);
    });
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
