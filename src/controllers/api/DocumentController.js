const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
var multer = require('multer');
var fs = require('fs');
/* function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
} */
exports.fetchPatientDocView = (req, res, next) => {
    console.log('Req Method: ', req.method);
    let authToken = req.headers["x-access-token"];
    console.log('x-access-token111: ',authToken);
    if (!authToken) {
        return res.status(403).send({
            success: false,
            message: "No token provided!"
        });
    }else{
        const {token, ext} = req.params;
        let sql = 'select * from patient_docs where token = "'+token+'" ';
        connectPool.query(sql, (error1, results, fields1) => {
            if (error1) {
                return res.status(200).json({
                    status: 0,
                    message: error1
                });
            }
            if (results.length > 0) {
                if(ext == 'pdf'){
                    var content_type = "application/pdf";
                }else if(ext == 'jpg' || ext == 'jpeg' || ext == 'png'){
                    var content_type = "image/png";
                }else{
                    console.log('Invalid file')
                    return res.status(200).json({
                        status: 0,
                        message: 'Resource not found'
                    });
                }
                var path = './public/upload/user/'+results[0].document;
                if (fs.existsSync(path)) {
                    // Convert to base64
                    /* var base64str = base64_encode(path);
                    res.send(base64str) */
                    /* var docFile = fs.readFileSync(path);
                    var b64File1 = Buffer.from(docFile).toString('base64');
                    console.log('b64File1: ', b64File1);
                    res.send(b64File1) */
                    /* const b64File2 = fs.readFileSync(path, {encoding: 'base64'});
                    console.log('b64File2: ', b64File2);
                    let buff = fs.readFileSync(path);
                    let b64File3 = buff.toString('base64');
                    console.log('b64File3: ', b64File3); */
                    // res.send(contents)
                    res.contentType(content_type);
                    fs.createReadStream(path).pipe(res)
                } else {
                    console.log('File not found');
                    return res.status(200).json({
                        status: 0,
                        message: 'Resource not found'
                    });
                }
            } else {
                return res.status(200).json({
                    status: 0,
                    message: 'Resource not found'
                });
            }
        });
    }
};