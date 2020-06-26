exports.handler = function (event, context, callback) {
    console.log("Incoming Event: ", event);
    const srcbucket = event.Records[0].s3.bucket.name;
    const srcfile = event.Records[0].s3.object.key;
    const message = `File is uploaded in - ${bucket} -> ${file}`;
    console.log(message);
    callback(null, message);

    var fs = require('fs');
    const path = require('path');

    let bucketParams = {
        Bucket: srcbucket,
        Key: srcfile
    };

    let textVal = path.parse(bucketParams.Key).name + 'ne'
    // read file from current directory
    s3.getObject(bucketParams, function (err, data) {

        if (err) throw err;
        let objectData = data.Body.toString('utf-8')
        var wordsArray = splitByWords(objectData);
        var wordsMap = createWordMap(wordsArray);
        var finalWordsArray = sortByCount(wordsMap);

        let ne = JSON.stringify(finalWordsArray);
        let json = { [textVal]: ne }
        console.log(json);
        fs.writeFile(textfile,JSON.stringify(json), err => { 
     
            // Checking for errors 
            if (err) throw err;  
           
            console.log("Done writing"); // Success 
        });
        read(textfile)

    });

    function read(file) {
        fs.readFile(file, function (err, data) {
            if (err) { throw err }
            basefile=path.basename(file)
    
            // Buffer Pattern; how to handle buffers; straw, intake/outtake analogy
            var base64data = new Buffer(data, 'binary');
    
            s3.putObject({
               'Bucket': 'tags-b00844989',
                'Key': basefile,
                'Body': base64data,
                'ACL': 'public-read'
             }, function (resp) {
                console.log(arguments);
                console.log('Successfully uploaded, ', file)
            })
        })
    }
    function splitByWords(text) {
        // split string by spaces (including spaces, tabs, and newlines)
        var wordsArray = text.split(/\s+/);
        return wordsArray;
    }


    function createWordMap(wordsArray) {

        // create map for word counts
        let wordsMap = {};
        /*
          wordsMap = {
            'Oh': 2,
            'Feelin': 1,
            ...
          }
        */
        wordsArray.forEach(function (key) {
            if (!!/[A-Z]/.exec(key.charAt(0))) {
                if (wordsMap.hasOwnProperty(key)) {

                    wordsMap[key]++;
                } else {
                    wordsMap[key] = 1;
                }
            }

        });

        return wordsMap;

    }


    function sortByCount(wordsMap) {

        // sort by count in descending order
        var finalWordsArray = [];
        finalWordsArray = Object.keys(wordsMap).map(function (key) {
            return {
                [key]: wordsMap[key]
                //name: key,
                //total: wordsMap[key]
            };
        });

        finalWordsArray.sort(function (a, b) {
            return b.total - a.total;
        });

        return finalWordsArray;

    }
}
