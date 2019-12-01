const https = require('https');

const url = 'https://reqres.in/api/users?page=2';

let makeAnotherRequest = true;
let apiData = '';
let totalBytesToFetch = 0;
let bytesFetched = 0;

function processData() {
    const { data } = JSON.parse(apiData);
    for (const user of data) {
        const {
            id, email, first_name, last_name, avatar,
        } = user;
        console.log(`${id}: ${email} ${first_name} ${last_name} ${avatar}`);
    }
}

(async () => {
    try {
        let start = 0;
        let end = 1023; // fetching 1KB data at one request
        while (makeAnotherRequest) {
            await reqData(start, end);
            start = end + 1;
            end += end;
        }
        processData();
    } catch (error) {
        console.error(error);
    }
})();

function reqData(start, end) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: `Range: bytes=${start}-${end}`,
        }, (res) => {
            res.setEncoding('utf8');
            if (totalBytesToFetch === 0) {
                const range = res.headers['content-range'];
                if (range && range.indexOf('/') > 0) {
                    totalBytesToFetch = res.headers['content-range'].split('/')[1];
                } else {
                    makeAnotherRequest = false;
                }
            }
            const dataSize = res.headers['content-length'];
            bytesFetched += dataSize;
            if (totalBytesToFetch === bytesFetched) {
                makeAnotherRequest = false;
            }

            res
                .on('data', (chunk) => { apiData += chunk; })
                .on('error', (error) => reject(error))
                .on('end', () => resolve(true));
        });
    });
}
