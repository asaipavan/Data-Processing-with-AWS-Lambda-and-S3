const mysql = require('mysql');

const connection = mysql.createConnection({

    host: process.env.RDS_LAMBDA_HOSTNAME,
    user: process.env.RDS_LAMBDA_USERNAME,

    password: process.env.RDS_LAMBDA_PASSWORD,

    port: process.env.RDS_LAMBDA_PORT,

    // calling direct inside code 

    connectionLimit: 10,

    multipleStatements: true,

    // Prevent nested sql statements 

    connectionLimit: 1000,

    connectTimeout: 60 * 60 * 1000,

    acquireTimeout: 60 * 60 * 1000,

    timeout: 60 * 60 * 1000,

    debug: true

});

exports.handler = function (event, context, callback) {

    console.log("Incoming Event: ", event);
    const srcbucket = event.Records[0].s3.bucket.name;
    const srcfile = event.Records[0].s3.object.key;
    const message = `File is uploaded in - ${bucket} -> ${file}`;
    console.log(message);
    callback(null, message);
    let bucketParams = {
        Bucket: srcbucket,
        Key: srcfile
    };

    s3.getObject(bucketParams, function (err, data) {

        if (err) throw err;
        let objectData = data.Body.toString('utf-8')
        // console.log(objectData)
        let jsondata = JSON.parse(objectData)


        const firstKey = Object.keys(jsondata)[0]
        let array = jsondata[firstKey]
        for (i = 0; i < array.length; i++) {
            let val = array[i]
            let namedEntity = Object.keys(val)[0];
            let frequency = Object.values(val)[0];
            let entitySet = {
                "NamedEntity": namedEntity,
                "Frequency": frequency
            }
            connection.query('Select NamedEntity,Frequency from lamdbadatabase.lambdatable where NamedEntity=?', [namedEntity], (err, results, fields) => {

                if (results.length === 0) {
                    connection.query('INSERT INTO lamdbadatabase.lambdatable SET ?', [entitySet], function (error, results, fields) {
                        if (error) {
                            console.log(error)
                        }

                    });
                }
                else {
                    let dbFrequency = results[0].Frequency
                    let overallFrequency = parseInt(dbFrequency) + parseInt(frequency)
                    connection.query('Update lamdbdadatabase.lambdatable set Frequency = ? where NamedEntity=?', [overallFrequency, namedEntity], function (error, results) {
                        if (error) {
                            console.log(error)
                        }

                    });
                }
            });


        }
    });
}