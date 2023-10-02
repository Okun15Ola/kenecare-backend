var fs = require('fs');

exports.getDocProfileVerificationData = (req, res) => {
    var data = req.body;
    var userSql = 'select * from user where id=' + data.user_id;
    connectPool.query(userSql, (userErrors, userResults, userFields) => {
        if (userErrors) {
            return res.status(200).json({
                status: 0,
                message: 'Something went wrong.'
            });
        }
        if (userResults.length > 0) {
            var sql = 'select id, document from doctor_profile_verification where user_id=' + data.user_id;
            connectPool.query(sql, (errors, results, fields) => {
                if (errors) {
                    return res.status(200).json({
                        status: 0,
                        message: 'Something went wrong.'
                    });
                }
                if (results.length > 0) {
                    var data = [];
                    for (var x = 0; x < results.length; x++) {
                        arr = {};
                        arr['id'] = results[x].id;
                        arr['document'] = BASE_URL + 'public/upload/user/' + results[x].document;
                        data.push(arr);
                    }
                    return res.status(200).json({
                        status: 1,
                        data: data,
                        approval_status: userResults[0].verification_status_by_admin
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'Data not found.'
                    });
                }
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'User not found.'
            });
        }

    });
};

exports.updateApprovalStatus = (req, res) => {
    const body = req.body;

    var id = body.uid;
    var type = body.type;
    var rejection_reason = body.rejection_reason;

    var fieldsToUpdate = {};
    fieldsToUpdate['verification_status_by_admin'] = type;
    if (type == 2) {
        fieldsToUpdate['verification_rejection_reason'] = rejection_reason;
    }
    var sqlUpdate = 'UPDATE user SET ? WHERE id = ' + id;
    connectPool.query(sqlUpdate, fieldsToUpdate, function(errors, results) {
        if (errors) {
            return res.status(200).json({
                status: 0,
                message: 'Something went wrong.'
            });
        }
        // Send doctor mail
        let sqlDr = 'select * from user WHERE id = ' + id;
        connectPool.query(sqlDr, (drError, drResults, drFields) => {
            if (drError) {
                return res.status(200).json({
                    status: 0,
                    message: drError.sqlMessage
                });
            }
            if(drResults[0].email !== null){
                var statusVal = '';
                if(type == 1){
                    statusVal = 'approved';
                }else if(type == 2){
                    statusVal = 'rejected';
                }
                var mailHtml='<p>Your profile docs has been '+statusVal+' successfully</p>';
                
                var mailOptions = {
                    from: process.env.MAIL_SENDER,
                    to: drResults[0].email,
                    subject: 'Profile docs '+statusVal,
                    html: mailHtml
                };
            
                mailerConfig.sendMail(mailOptions, function(mailError, mailInfo) {
                    if (mailError) {
                        return res.status(200).json({
                            status: 0,
                            message: mailError.response
                        });
                    }
                    return res.status(200).json({
                        status: 1,
                        message: 'Verification status has been updated!'
                    });
                });
            }else{
                return res.status(200).json({
                    status: 1,
                    message: 'Verification status has been updated!'
                });
            }
        });
    });
};

exports.updateDrAuthApprovalStatus = (req, res) => {
    const body = req.body;

    var id = body.uid;
    var status = body.status;

    var fieldsToUpdate = {};
    fieldsToUpdate['doctor_approval_status'] = status;
    var sqlUpdate = 'UPDATE user SET ? WHERE id = ' + id;
    connectPool.query(sqlUpdate, fieldsToUpdate, function(errors, results) {
        if (errors) {
            return res.status(200).json({
                status: 0,
                message: 'Something went wrong.'
            });
        }
        // Send doctor mail
        let sqlDr = 'select * from user WHERE id = ' + id;
        connectPool.query(sqlDr, (drError, drResults, drFields) => {
            if (drError) {
                return res.status(200).json({
                    status: 0,
                    message: drError.sqlMessage
                });
            }
            if(drResults[0].email !== null){
                var statusVal = '';
                if(status == 1){
                    statusVal = 'approved';
                }else if(status == 2){
                    statusVal = 'rejected';
                }
                var mailHtml='<p>Your profile has been '+statusVal+' successfully</p>';
                
                var mailOptions = {
                    from: process.env.MAIL_SENDER,
                    to: drResults[0].email,
                    subject: 'Profile '+statusVal,
                    html: mailHtml
                };
            
                mailerConfig.sendMail(mailOptions, function(mailError, mailInfo) {
                    if (mailError) {
                        return res.status(200).json({
                            status: 0,
                            message: mailError.response
                        });
                    }
                    return res.status(200).json({
                        status: 1,
                        message: 'Verification status has been updated!'
                    });
                });
            }else{
                return res.status(200).json({
                    status: 1,
                    message: 'Verification status has been updated!'
                });
            }
        });
    });
};

exports.getDoctorFullDetails = (req, res) => {
    const { body } = req;
    connectPool.query(' SELECT a.*, b.name as specialty, c.name as city, d.name as registration_council, e.name as degree FROM user a LEFT JOIN specialization b ON a.specialization_id = b.id LEFT JOIN city c ON a.city_id = c.id LEFT JOIN registration_council d ON a.registration_council_id = d.id LEFT JOIN degree e ON a.degree_id = e.id WHERE b.status = 1 AND a.type = 2 AND a.id = ' + body.user_id, (error, results, fields) => {
        if (results.length > 0) {
            if (error) {
                return res.status(200).json({
                    status: 0,
                    message: error
                });
            }
            var data = {};
            data = results[0];
            data['id'] = results[0].id;
            data['name'] = results[0].name;
            data['mobile_no'] = results[0].mobile_no;
            data['type'] = results[0].type;
            data['email'] = results[0].email;
            data['gender'] = results[0].gender;
            var img = BASE_URL + 'public/upload/placeholder.png';
            if (results[0].image != '') {
                var imagePath = 'public/upload/user/' + results[0].image;
                if (fs.existsSync(imagePath)) {
                    var img = BASE_URL + 'public/upload/user/' + results[0].image;
                }
            }
            data['image'] = img;
            data['system_currency'] = process.env.SYSTEM_CURRENCY;

            var sql1 = 'select id, document from doctor_profile_verification where user_id=' + body.user_id;
            connectPool.query(sql1, (docErrors, docResults, docFields) => {
                if (docErrors) {
                    return res.status(200).json({
                        status: 0,
                        message: 'Something went wrong.'
                    });
                }
                var documents = [];
                if (docResults.length > 0) {
                    for (var x = 0; x < docResults.length; x++) {
                        arr = {};
                        arr['id'] = docResults[x].id;
                        arr['document'] = BASE_URL + 'public/upload/user/' + docResults[x].document;
                        documents.push(arr);
                    }
                }
                data['profile_verification_docs'] = documents;   
                return res.status(200).json({
                    status: 1,
                    message: "Data found!",
                    data: data
                });
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'Data not found!'
            });
        }
    });
};

exports.getUserBankDetails = (req, res) => {
    var data = req.body;
    var userSql = 'select id, account_holder_name, email, bank_name, account_number, swift_code, branch from user_bank_details where user_id=' + data.user_id + ' LIMIT 1';
    connectPool.query(userSql, (error, results, fields) => {
        if (error) {
            return res.status(200).json({
                status: 0,
                message: 'Something went wrong.'
            });
        }
        if (results.length > 0) {
            return res.status(200).json({
                status: 1,
                data: results
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'Data not found.'
            });
        }

    });
};