const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
const { compareSync, hashSync, genSaltSync } = require("bcryptjs");
const { getTimeSlots, generateRandomString } = require('./helpers/common');
var multer = require('multer');
var fs = require('fs');
var path = require('path');

exports.get_user_profile = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "user_id": "required",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            var user_id = body.user_id;
            connectPool.query('select *, DATE_FORMAT(mr_otp_created_at, "%Y-%m-%d %H:%i:%s") as mr_otp_created_at, DATE_FORMAT(mr_otp_expires_on, "%Y-%m-%d %H:%i:%s") as mr_otp_expires_on from user where id =' + user_id, (error, results, fields) => {
                if (error) {
                    return res.status(200).json({
                        status: 0,
                        message: error
                    });
                }
                if (results.length > 0) {
                    var data = {};
                    data['id'] = results[0].id;
                    data['name'] = results[0].name;
                    data['email'] = results[0].email;
                    data['mobile_no'] = results[0].mobile_no;
                    data['type'] = results[0].type;
                    var img = BASE_URL + 'public/upload/placeholder.png';
                    if (results[0].image != '') {
                        var imagePath = 'public/upload/user/' + results[0].image;
                        if (fs.existsSync(imagePath)) {
                            var img = BASE_URL + 'public/upload/user/' + results[0].image;
                        }
                    }
                    data['image'] = img;
                    data['specialization_id'] = results[0].specialization_id;
                    data['gender'] = results[0].gender;
                    data['position'] = results[0].position;
                    data['city_id'] = results[0].city_id;
                    data['registration_number'] = results[0].registration_number;
                    data['registration_council_id'] = results[0].registration_council_id;
                    data['registration_year'] = results[0].registration_year;
                    data['degree_id'] = results[0].degree_id;
                    data['college'] = results[0].college;
                    data['year_of_completion'] = results[0].year_of_completion;
                    data['year_of_experience'] = results[0].year_of_experience;
                    data['profile_status'] = results[0].profile_status;
                    data['verification_status_by_admin'] = results[0].verification_status_by_admin;
                    data['verification_rejection_reason'] = results[0].verification_rejection_reason;
                    data['doc_morning_start_time'] = results[0].doc_morning_start_time;
                    data['doc_morning_end_time'] = results[0].doc_morning_end_time;
                    data['doc_evening_start_time'] = results[0].doc_evening_start_time;
                    data['doc_evening_end_time'] = results[0].doc_evening_end_time;
                    data['consultation_fee'] = results[0].consultation_fee;
                    data['hospital_name'] = results[0].hospital_name;
                    data['mr_otp_sent'] = results[0].mr_otp_sent;
                    data['mr_otp_created_at'] = results[0].mr_otp_created_at;
                    data['mr_otp_expires_on'] = results[0].mr_otp_expires_on;
                    data['not_available_on'] = results[0].doctor_not_available_on;
                    data['about'] = results[0].about;
                    data['stories'] = results[0].stories;

                    connectPool.query('select id,doctor_id,question,answer from doctor_qa where doctor_id =' + user_id, (errorQa, resultsQa, fieldsQa) => {
                        if (errorQa) {
                            return res.status(200).json({
                                status: 0,
                                message: errorQa
                            });
                        }
                        var qaData = [];
                        for (var x = 0; x < resultsQa.length; x++) {
                            arr = {};
                            arr = resultsQa[x];
                            qaData.push(arr);
                        }
                        data['qa_data'] = qaData;
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
        } else {
            return res.status(200).json({
                status: 0,
                message: 'All Field Required'
            });
        }
    });
};
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './public/upload/user');
    },
    filename: function(req, file, callback) {
        let extArray = file.originalname.split(".");
        let extension = extArray[extArray.length - 1];
        callback(null, file.fieldname + '-' + Date.now() + '.' + extension);
    }
});
var upload = multer({ storage: storage }).single('image');
exports.edit_user_profile = (req, res, next) => {
    upload(req, res, function(err) {
        if (req.file) {
            const validationRule = {
                "user_id": "required",
                "name": "required",
                "mobile_no": "required"
            }
            validator(req.body, validationRule, {}, (err, status) => {
                if (status) {
                    var user_id = req.body.user_id;
                    var name = req.body.name;
                    var mobile_no = req.body.mobile_no;
                    var prof_pic = req.file.filename;
                    connectPool.query('select * from user where type=1 and id =' + user_id, (error, results, fields) => {
                        if (results.length > 0) {
                            connectPool.query('SELECT * FROM user WHERE mobile_no ="' + mobile_no + '" and id !=' + user_id, function(erro, result, field) {
                                if (erro) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: erro
                                    });
                                }
                                if (result.length > 0) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: 'This Mobile No is already exist'
                                    });
                                } else {
                                    var fieldsToUpdate = {};
                                    fieldsToUpdate['name'] = name;
                                    fieldsToUpdate['mobile_no'] = mobile_no;
                                    fieldsToUpdate['image'] = prof_pic;
                                    var sqlupdate = 'UPDATE user SET ? WHERE id  = ' + user_id;
                                    connectPool.query(sqlupdate, fieldsToUpdate, function(error, results) {
                                        if (error) {
                                            return res.status(200).json({
                                                status: 0,
                                                message: error
                                            });
                                        }
                                        return res.status(200).json({
                                            status: 1,
                                            message: "Profile has been updated successfully!",
                                        });
                                    });
                                }
                            });
                        } else {
                            return res.status(200).json({
                                status: 0,
                                message: 'Data not found!'
                            });
                        }
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'All Field Required'
                    });
                }
            });
        } else {
            const validationRule = {
                "user_id": "required",
                "name": "required",
                "mobile_no": "required"
            }
            validator(req.body, validationRule, {}, (err, status) => {
                if (status) {
                    var user_id = req.body.user_id;
                    var name = req.body.name;
                    var mobile_no = req.body.mobile_no;
                    connectPool.query('select * from user where type=1 and id =' + user_id, (error, results, fields) => {
                        if (results.length > 0) {
                            connectPool.query('SELECT * FROM user WHERE mobile_no ="' + mobile_no + '" and id !=' + user_id, function(erro, result, field) {
                                if (erro) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: erro
                                    });
                                }
                                if (result.length > 0) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: 'This Mobile No is already exist'
                                    });
                                } else {
                                    var fieldsToUpdate = {};
                                    fieldsToUpdate['name'] = name;
                                    fieldsToUpdate['mobile_no'] = mobile_no;
                                    var sqlupdate = 'UPDATE user SET ? WHERE id  = ' + user_id;
                                    connectPool.query(sqlupdate, fieldsToUpdate, function(error, results) {
                                        if (error) {
                                            return res.status(200).json({
                                                status: 0,
                                                message: error
                                            });
                                        }
                                        return res.status(200).json({
                                            status: 1,
                                            message: "Profile has been updated successfully!",
                                        });
                                    });
                                }
                            });
                        } else {
                            return res.status(200).json({
                                status: 0,
                                message: 'Data not found!'
                            });
                        }
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'All Field Required'
                    });
                }
            });
        }
    });
};
exports.get_doctor_profile = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "user_id": "required",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            var user_id = body.user_id;
            connectPool.query('select * from user where type=2 and id =' + user_id, (error, results, fields) => {
                if (results.length > 0) {
                    if (error) {
                        return res.status(200).json({
                            status: 0,
                            message: error
                        });
                    }
                    var data = {};
                    data['id'] = results[0].name;
                    data['name'] = results[0].name;
                    data['mobile_no'] = results[0].mobile_no;
                    data['type'] = results[0].type;
                    return res.status(200).json({
                        status: 1,
                        message: "Data found!",
                        data: data
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'Data not found!'
                    });
                }
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'All Field Required'
            });
        }
    });
};
exports.edit_doctor_profile = (req, res, next) => {
    upload(req, res, function(err) {
        const validationRule = {
            "user_id": "required",
            "name": "required",
            "email": "required"
        }
        validator(req.body, validationRule, {}, (err, status) => {
            if (status) {
                var data = req.body;
                connectPool.query('select * from user where type=2 and id =' + data.user_id, (error, results, fields) => {
                    if (results.length > 0) {
                        var fieldsToUpdate = {};
                        fieldsToUpdate['name'] = data.name;
                        fieldsToUpdate['email'] = data.email;
                        if ((req.file != '' && typeof req.file !== 'undefined')) {
                            fieldsToUpdate['image'] = req.file.filename;
                        }
                        fieldsToUpdate['gender'] = data.gender;
                        fieldsToUpdate['specialization_id'] = data.specialization_id;
                        fieldsToUpdate['position'] = data.position;
                        fieldsToUpdate['city_id'] = data.city_id;
                        fieldsToUpdate['registration_number'] = data.registration_number;
                        fieldsToUpdate['registration_council_id'] = data.registration_council_id;
                        fieldsToUpdate['registration_year'] = data.registration_year;
                        fieldsToUpdate['degree_id'] = data.degree_id;
                        fieldsToUpdate['college'] = data.college;
                        fieldsToUpdate['year_of_completion'] = data.year_of_completion;
                        fieldsToUpdate['year_of_experience'] = data.year_of_experience;
                        fieldsToUpdate['doc_morning_start_time'] = data.doc_morning_start_time;
                        fieldsToUpdate['doc_morning_end_time'] = data.doc_morning_end_time;
                        fieldsToUpdate['doc_evening_start_time'] = data.doc_evening_start_time;
                        fieldsToUpdate['doc_evening_end_time'] = data.doc_evening_end_time;
                        fieldsToUpdate['consultation_fee'] = data.consultation_fee;
                        fieldsToUpdate['hospital_name'] = data.hospital_name;
                        fieldsToUpdate['doctor_not_available_on'] = data.not_available_on;
                        fieldsToUpdate['about'] = data.about;
                        fieldsToUpdate['stories'] = data.stories;

                        let profile_status = 0;
                        if (data.name != '' && data.email != '' && (req.file != '' || results[0].image != '') && data.gender != '' && data.specialization_id != '' && data.position != '' && data.city_id != '' && data.registration_number != '' && data.registration_council_id != '' && data.registration_year != '' && data.degree_id != '' && data.college != '' && data.year_of_completion != '' && data.year_of_experience != '' && data.doc_morning_start_time != '' && data.doc_morning_end_time != '' && data.doc_evening_start_time != '' && data.doc_evening_end_time != '' && data.consultation_fee != '' && data.hospital_name != '') {
                            profile_status = 1;
                            fieldsToUpdate['profile_status'] = profile_status;
                        }

                        var sqlUpdate = 'UPDATE user SET ? WHERE id  = ' + data.user_id;
                        connectPool.query(sqlUpdate, fieldsToUpdate, function(error, results) {
                            if (error) {
                                return res.status(200).json({
                                    status: 0,
                                    message: error
                                });
                            }

                            const qaData = [];
                            for (let i = 1; i <= data.rowCntQA; i++) {
                                var que = 'qa_que'+i;
                                que = data[que];
                                var ans = 'qa_ans'+i;
                                ans = data[ans];
                                if((que !== '' && que !== undefined) && (ans !== '' && ans !== undefined)){
                                    qaData.push([data.user_id, que, ans]);
                                }
                            }
                            const sqlDelQA = 'DELETE FROM doctor_qa WHERE doctor_id =' + data.user_id;
                            connectPool.query(sqlDelQA, (errorQa, resultsQa, fieldsQa) => {
                                if (errorQa) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: errorQa
                                    });
                                }
                                if(qaData.length > 0){
                                    const sqlInsertQA = 'INSERT INTO `doctor_qa` (`doctor_id`, `question`, `answer`) VALUES ?';
                                    connectPool.query(sqlInsertQA, [qaData], function(error, results) {
                                        if (error) {
                                            return res.status(200).json({
                                                status: 0,
                                                message: error
                                            });
                                        }
                                        return res.status(200).json({
                                            status: 1,
                                            message: "Profile has been updated successfully!",
                                            profile_status: profile_status
                                        });
                                    });
                                }else{
                                    return res.status(200).json({
                                        status: 1,
                                        message: "Profile has been updated successfully!",
                                        profile_status: profile_status
                                    });
                                }
                            });
                        });
                    } else {
                        return res.status(200).json({
                            status: 0,
                            message: 'Data not found!'
                        });
                    }
                });
            } else {
                return res.status(200).json({
                    status: 0,
                    message: 'All Field Required'
                });
            }
        });
    });
};
const uploadFiles = multer({ storage: storage }).array('prof_images');
exports.doctor_profile_verification = (req, res, next) => {
    uploadFiles(req, res, function(err) {
        const validationRule = {
            "user_id": "required"
        }
        validator(req.body, validationRule, {}, (err, status) => {
            if (status) {
                var data = req.body;
                connectPool.query('select * from user where type=2 and id =' + data.user_id, (error, results, fields) => {
                    if (results.length > 0) {
                        const docFiles = [];
                        var fileKeys = Object.keys(req.files);
                        if (req.files != '') {
                            const sqlFetch = 'SELECT * FROM `doctor_profile_verification` WHERE user_id = ' + data.user_id;
                            connectPool.query(sqlFetch, function(errorFetch, resultFetch) {
                                if(errorFetch){
                                    return res.status(200).json({
                                        status: 0,
                                        message: errorFetch
                                    });
                                }
                                if(resultFetch.length > 0){
                                    const sqlDelete = 'DELETE FROM `doctor_profile_verification` WHERE user_id = ' + data.user_id;
                                    connectPool.query(sqlDelete, function(errorDel, resultDel) {
                                        if(errorDel){
                                            return res.status(200).json({
                                                status: 0,
                                                message: errorDel
                                            });
                                        }
                                        for (var x = 0; x < resultFetch.length; x++) {
                                            var imagePath = 'public/upload/user/'+resultFetch[x].document;
                                            if (fs.existsSync(imagePath)) {
                                                fs.unlinkSync(imagePath);
                                            }
                                        }
                                    });
                                }
                                fileKeys.forEach(function(key) {
                                    docFiles.push([data.user_id, data.document_name[key], req.files[key].filename, data.expiry_date[key]]);
                                });
                                const sqlInsert = 'INSERT INTO `doctor_profile_verification` (`user_id`, `document_name`, `document`, `expiry_date`) VALUES ?';
                                connectPool.query(sqlInsert, [docFiles], function(error, results) {
                                    if (error) {
                                        return res.status(200).json({
                                            status: 0,
                                            message: error
                                        });
                                    }
                                    const sqlUpdate = 'UPDATE `user` SET verification_status_by_admin = 3, verification_rejection_reason = "" WHERE id = ' + data.user_id;
                                    connectPool.query(sqlUpdate, function(error, results) {
                                        return res.status(200).json({
                                            status: 1,
                                            message: "Documents has been uploaded successfully!",
                                        });
                                    });
                                });
                            });
                        } else {
                            return res.status(200).json({
                                status: 0,
                                message: 'Data not saved!'
                            });
                        }
                    } else {
                        return res.status(200).json({
                            status: 0,
                            message: 'Data not found!'
                        });
                    }
                });
            } else {
                return res.status(200).json({
                    status: 0,
                    message: 'All Field Required'
                });
            }
        });
    });
};
exports.get_doctor_profile_verification = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "user_id": "required",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            var user_id = body.user_id;
            connectPool.query('select * from user where type=2 and id =' + user_id, (error, results, fields) => {
                if (results.length > 0) {
                    if (error) {
                        return res.status(200).json({
                            status: 0,
                            message: error
                        });
                    }
                    connectPool.query('select id, document_name, document, DATE_FORMAT(expiry_date, "%d %b %Y") as expiry_date from doctor_profile_verification where user_id =' + user_id, (error1, results1, fields1) => {
                        if (error1) {
                            return res.status(200).json({
                                status: 0,
                                message: error1
                            });
                        }
                        if (results1.length > 0) {
                            var data = [];
                            for (var x = 0; x < results1.length; x++) {
                                arr = {};
                                arr['id'] = results1[x].id;
                                arr['document_name'] = results1[x].document_name;
                                arr['document'] = BASE_URL + 'public/upload/user/' + results1[x].document;
                                arr['expiry_date'] = (results1[x].expiry_date != null && results1[x].expiry_date !== '0000-00-00') ? results1[x].expiry_date : "";
                                data.push(arr);
                            }
                            return res.status(200).json({
                                status: 1,
                                message: "Data found!",
                                data: data
                            });
                        } else {
                            return res.status(200).json({
                                status: 0,
                                message: 'Data not found!'
                            });
                        }
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'User not found!'
                    });
                }
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'All Field Required'
            });
        }
    });
};
exports.getDoctorDetails = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "doctor_id": "required",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            var doctor_id = body.doctor_id;
            let sql = 'SELECT a.*, b.name as specialty FROM user a LEFT JOIN specialization b ON a.specialization_id = b.id WHERE b.status = 1 AND a.type = 2 AND a.id = ' + doctor_id + ' LIMIT 1';
            connectPool.query(sql, (error, results, fields) => {
                if (error) {
                    return res.status(200).json({
                        status: 0,
                        message: error
                    });
                }
                if (results.length > 0) {
                    if(results[0].hasOwnProperty('password')){
                        delete results[0]['password'];
                    }

                    let sql1 = 'select id,doctor_id,question,answer from doctor_qa where doctor_id =' + doctor_id;
                    connectPool.query(sql1, (error1, results1, fields1) => {
                        if (error1) {
                            return res.status(200).json({
                                status: 0,
                                message: error1
                            });
                        }
                        
                        var data = [];
                        var i = 0;
                        for (var x = 0; x < results.length; x++) {
                            arr = {};
                            arr = results[x];
                            var img = BASE_URL + 'public/upload/placeholder.png';
                            if (results[x].image != '') {
                                var imagePath = 'public/upload/user/' + results[x].image;
                                if (fs.existsSync(imagePath)) {
                                    var img = BASE_URL + 'public/upload/user/' + results[x].image;
                                }
                            }
                            arr['image'] = img;
                            arr['qa_data'] = results1;
                            data.push(arr);
                            i++;
                        }
    
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
        } else {
            return res.status(200).json({
                status: 0,
                message: 'All Field Required'
            });
        }
    });
};
exports.getDoctorSlots = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "doctor_id": "required",
        "appointment_date" : "required"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            var doctor_id = body.doctor_id;
            var appointment_date = body.appointment_date;
            let sql = 'SELECT a.*, b.name as specialty FROM user a LEFT JOIN specialization b ON a.specialization_id = b.id WHERE b.status = 1 AND a.type = 2 AND a.id = ' + doctor_id + ' LIMIT 1';
            connectPool.query(sql, (error, results, fields) => {
                if (error) {
                    return res.status(200).json({
                        status: 0,
                        message: error
                    });
                }
                if (results.length > 0) {
                    let tsArr = getTimeSlots(results[0].doc_morning_start_time, results[0].doc_morning_end_time, results[0].doc_evening_start_time, results[0].doc_evening_end_time, appointment_date);
                    var data = [];
                    var arr = {};

                    // Today
                    let sql1 = 'SELECT *, DATE_FORMAT(appointment_date, "%Y-%m-%d") as appointment_date FROM appointment WHERE doctor_id = ' + doctor_id + ' AND appointment_date = "'+appointment_date+'" ORDER BY id ASC';
                    connectPool.query(sql1, (error1, results1, fields1) => {
                        var today_appointments = results1;
                        if(today_appointments.length > 0){
                            
                            // Morning
                            let total_bookings = 0;
                            var mor_eve_time_slots = [];
                            var tsMorArr = [];
                            tsArr.morning_time_slots.forEach(element1 => {
                                var morBookingCnt = 0;
                                var arr1 = {};
                                for (var x1 = 0; x1 < results1.length; x1++) {
                                    if(element1 === results1[x1].start_time){
                                        morBookingCnt=1;
                                        total_bookings++;
                                    }
                                }
                                arr1['slot'] = element1;
                                arr1["is_booked"] = morBookingCnt;
                                tsMorArr.push(arr1);
                            });
                            var mts = {};
                            mts['morning_time_slots'] = tsMorArr;
                            mor_eve_time_slots.push(mts);
                            
                            // Evening
                            var tsEveArr = [];
                            tsArr.evening_time_slots.forEach(element2 => {
                                var eveBookingCnt = 0;
                                var arr2 = {};
                                for (var x1 = 0; x1 < results1.length; x1++) {
                                    if(element2 === results1[x1].start_time){
                                        eveBookingCnt=1;
                                        total_bookings++;
                                    }
                                }
                                arr2['slot'] = element2;
                                arr2["is_booked"] = eveBookingCnt;
                                tsEveArr.push(arr2);
                            });
                            var ets = {};
                            ets['evening_time_slots'] = tsEveArr;
                            mor_eve_time_slots.push(ets);

                            // Total available slot calculation
                            let today_available_ts = (parseInt(tsArr.morning_time_slots.length) + parseInt(tsArr.evening_time_slots.length)) - parseInt(total_bookings);

                            arr['time_slots'] = mor_eve_time_slots;
                            arr['today_available_time_slots'] = parseInt(today_available_ts);
                        }else{
                            // Check Morning Slots
                            var tsMorArr = [];
                            tsArr.morning_time_slots.forEach(element1 => {
                                var arr3 = {};
                                arr3['slot'] = element1;
                                arr3["is_booked"] = 0;
                                tsMorArr.push(arr3);
                            });

                            // Check Evening Slots
                            var tsEveArr = [];
                            tsArr.evening_time_slots.forEach(element2 => {
                                var arr4 = {};
                                arr4['slot'] = element2;
                                arr4["is_booked"] = 0;
                                tsEveArr.push(arr4);
                            });
                            var mor_eve_time_slots = [];
                            var mts = {};
                            mts['morning_time_slots'] = tsMorArr;
                            mor_eve_time_slots.push(mts);
                            var ets = {};
                            ets['evening_time_slots'] = tsEveArr;
                            mor_eve_time_slots.push(ets);
                            arr['time_slots'] = mor_eve_time_slots;
                            arr['today_available_time_slots'] = parseInt(tsMorArr.length) + parseInt(tsEveArr.length);
                        }

                        // Tomorrow
                        let sql2 = 'SELECT *, DATE_FORMAT(appointment_date, "%Y-%m-%d") as appointment_date FROM appointment WHERE doctor_id = ' + doctor_id + ' AND appointment_date = DATE_ADD("' + appointment_date + '", INTERVAL 1 DAY) ORDER BY id ASC';
                        connectPool.query(sql2, (error2, results2, fields2) => {
                            var tomorrow_appointments = results2;
                            if(tomorrow_appointments.length > 0){
                                tomorrow_appointments.forEach(element => {
                                    // Check Morning Slots
                                    var tsMorArrTom = [];
                                    tsArr.morning_time_slots_tom.forEach(element1 => {
                                        if((element1 !== element.start_time)){
                                            var arr5 = {};
                                            arr5['slot'] = element1;
                                            tsMorArrTom.push(arr5);
                                        }
                                    });
                                    // Check Evening Slots
                                    var tsEveArrTom = [];
                                    tsArr.evening_time_slots_tom.forEach(element2 => {
                                        if((element2 !== element.start_time)){
                                            var arr6 = {};
                                            arr6['slot'] = element2;
                                            tsEveArrTom.push(arr6);
                                        }
                                    });

                                    arr['tomorrow_available_time_slots'] = parseInt(tsMorArrTom.length) + parseInt(tsEveArrTom.length);
                                });
                            }else{
                                // Check Morning Slots
                                var tsMorArrTom = [];
                                tsArr.morning_time_slots_tom.forEach(element1 => {
                                    var arr7 = {};
                                    arr7['slot'] = element1;
                                    arr7["is_booked"] = 0;
                                    tsMorArrTom.push(arr7);
                                });

                                // Check Evening Slots
                                var tsEveArrTom = [];
                                tsArr.evening_time_slots_tom.forEach(element2 => {
                                    var arr8 = {};
                                    arr8['slot'] = element2;
                                    arr8["is_booked"] = 0;
                                    tsEveArrTom.push(arr8);
                                });
                                arr['tomorrow_available_time_slots'] = parseInt(tsMorArrTom.length) + parseInt(tsEveArrTom.length);
                            }
                            data.push(arr);

                            return res.status(200).json({
                                status: 1,
                                message: "Data found!",
                                data: data
                            });
                        });
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'Data not found!'
                    });
                }
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'All Field Required'
            });
        }
    });
};

exports.get_patient_docs = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "user_id": "required",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            var user_id = body.user_id;
            connectPool.query('select * from user where type=1 and id =' + user_id, (error, results, fields) => {
                if (error) {
                    return res.status(200).json({
                        status: 0,
                        message: error
                    });
                }
                if (results.length > 0) {
                    let sql = 'select id, document, token, DATE_FORMAT(created_at, "%d %b %Y") as created_at from patient_docs where user_id =' + user_id;
                    connectPool.query(sql, (error1, results1, fields1) => {
                        if (error1) {
                            return res.status(200).json({
                                status: 0,
                                message: error1
                            });
                        }
                        if (results1.length > 0) {
                            var data = [];
                            for (var x = 0; x < results1.length; x++) {
                                /* arr = {};
                                arr = results1[x];
                                arr['document'] = BASE_URL + 'public/upload/user/' + results1[x].document;
                                data.push(arr); */
                                
                                arr = {};
                                // arr = results1[x];
                                var ext = path.extname(results1[x].document);
                                var ext_name = ext.replace('.', '');
                                arr['id'] = results1[x].id;
                                arr['token'] = results1[x].token;
                                arr['ext'] = ext_name;
                                arr['created_at'] = results1[x].created_at;
                                // arr['document'] = BASE_URL + 'public/upload/user/' + results1[x].document;
                                data.push(arr);
                            }
                            return res.status(200).json({
                                status: 1,
                                message: "Data found!",
                                data: data
                            });
                        } else {
                            return res.status(200).json({
                                status: 0,
                                message: 'Data not found!'
                            });
                        }
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'User not found!'
                    });
                }
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'All Field Required'
            });
        }
    });
};

// Patient profile Start
var uploadPatientImage = multer({ storage: storage }).single('image');
exports.edit_patient_profile = (req, res, next) => {
    uploadPatientImage(req, res, function(err) {
        if (req.file) {
            const validationRule = {
                "user_id": "required",
                "name": "required",
                "email": "required"
            }
            validator(req.body, validationRule, {}, (err, status) => {
                if (status) {
                    var user_id = req.body.user_id;
                    var name = req.body.name;
                    var email = req.body.email;
                    var prof_pic = req.file.filename;
                    var gender = req.body.gender;
                    connectPool.query('select * from user where type=1 and id =' + user_id, (error, results, fields) => {
                        if (results.length > 0) {
                            connectPool.query('SELECT * FROM user WHERE email ="' + email + '" and id !=' + user_id, function(erro, result, field) {
                                if (erro) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: erro
                                    });
                                }
                                if (result.length > 0) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: 'The email already exist'
                                    });
                                } else{
                                    var fieldsToUpdate = {};
                                    fieldsToUpdate['name'] = name;
                                    fieldsToUpdate['email'] = email;
                                    fieldsToUpdate['gender'] = gender;
                                    fieldsToUpdate['image'] = prof_pic;
                                    var sqlupdate = 'UPDATE user SET ? WHERE id  = ' + user_id;
                                    connectPool.query(sqlupdate, fieldsToUpdate, function(error, results) {
                                        if (error) {
                                            return res.status(200).json({
                                                status: 0,
                                                message: error
                                            });
                                        }
                                        return res.status(200).json({
                                            status: 1,
                                            message: "Profile has been updated successfully!",
                                        });
                                    });
                                }
                            });
                        } else {
                            return res.status(200).json({
                                status: 0,
                                message: 'Data not found!'
                            });
                        }
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'All Field Required'
                    });
                }
            });
        } else {
            const validationRule = {
                "user_id": "required",
                "name": "required",
                "email": "required"
            }
            validator(req.body, validationRule, {}, (err, status) => {
                if (status) {
                    var user_id = req.body.user_id;
                    var name = req.body.name;
                    var email = req.body.email;
                    var gender = req.body.gender;
                    connectPool.query('select * from user where type=1 and id =' + user_id, (error, results, fields) => {
                        if (results.length > 0) {
                            connectPool.query('SELECT * FROM user WHERE email ="' + email + '" and id !=' + user_id, function(erro, result, field) {
                                if (erro) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: erro
                                    });
                                }
                                if (result.length > 0) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: 'The email already exist'
                                    });
                                } else {
                                    var fieldsToUpdate = {};
                                    fieldsToUpdate['name'] = name;
                                    fieldsToUpdate['email'] = email;
                                    fieldsToUpdate['gender'] = gender;
                                    var sqlupdate = 'UPDATE user SET ? WHERE id  = ' + user_id;
                                    connectPool.query(sqlupdate, fieldsToUpdate, function(error, results) {
                                        if (error) {
                                            return res.status(200).json({
                                                status: 0,
                                                message: error
                                            });
                                        }
                                        return res.status(200).json({
                                            status: 1,
                                            message: "Profile has been updated successfully!",
                                        });
                                    });
                                }
                            });
                        } else {
                            return res.status(200).json({
                                status: 0,
                                message: 'Data not found!'
                            });
                        }
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'All Field Required'
                    });
                }
            });
        }
    });
};

const uploadUserFiles = multer({ storage: storage }).array('patient_docs');
exports.edit_patient_profile_docs = (req, res, next) => {
    uploadUserFiles(req, res, function(err) {
        const validationRule = {
            "user_id": "required"
        }
        validator(req.body, validationRule, {}, (err, status) => {
            if (status) {
                var data = req.body;
                connectPool.query('select * from user where type=1 and id =' + data.user_id, (error, results, fields) => {
                    if (results.length > 0) {
                        const docFiles = [];
                        var fileKeys = Object.keys(req.files);
                        if (req.files != '') {
                            /* const sqlDelete = 'DELETE FROM `patient_docs` WHERE user_id = ' + data.user_id;
                            connectPool.query(sqlDelete, function(errorDel, resultDel) {
                            }); */
                            const docToken = generateRandomString(32);
                            fileKeys.forEach(function(key) {
                                docFiles.push([data.user_id, req.files[key].filename, docToken]);
                            });
                            const sqlInsert = 'INSERT INTO `patient_docs` (`user_id`, `document`, `token`) VALUES ?';
                            connectPool.query(sqlInsert, [docFiles], function(error, results) {
                                if (error) {
                                    return res.status(200).json({
                                        status: 0,
                                        message: error
                                    });
                                }
                                return res.status(200).json({
                                    status: 1,
                                    message: "Documents has been uploaded successfully!",
                                });
                            });
                        } else {
                            return res.status(200).json({
                                status: 0,
                                message: 'Data not saved!'
                            });
                        }
                    } else {
                        return res.status(200).json({
                            status: 0,
                            message: 'Data not found!'
                        });
                    }
                });
            } else {
                return res.status(200).json({
                    status: 0,
                    message: 'All Field Required'
                });
            }
        });
    });
};
// Patient profile End

exports.getDoctorsByLocation = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "location": "required",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            var location = body.location;
            var doctor_name = body.doctor_name;
            var filterSql = '';
            if(doctor_name){
                filterSql += ' AND a.name LIKE "%'+doctor_name+'%"';
            }
            let sql = 'SELECT a.*, a.id as doctor_id, c.name as specialty FROM user a LEFT JOIN specialization c ON a.specialization_id = c.id WHERE a.type = 2 AND a.city_id = ' + location + ' AND (a.doc_morning_start_time <> "" AND a.doc_morning_end_time <> "" AND a.doc_evening_start_time <> "" AND a.doc_evening_end_time <> "") '+filterSql+' ORDER BY a.id DESC';

            connectPool.query(sql, (error, results, fields) => {
                if (error) {
                    return res.status(200).json({
                        status: 0,
                        message: error
                    });
                }
                if (results.length > 0) {
                    var data = [];
                    var i = 0;
                    for (var x = 0; x < results.length; x++) {
                        arr = {};
                        arr = results[x];
                        var img = BASE_URL + 'public/upload/placeholder.png';
                        if (results[x].doctor_image != '') {
                            var imagePath = 'public/upload/user/' + results[x].doctor_image;
                            if (fs.existsSync(imagePath)) {
                                var img = BASE_URL + 'public/upload/user/' + results[x].doctor_image;
                            }
                        }
                        arr['doctor_image'] = img;
                        data.push(arr);
                        i++;
                    }
                    return res.status(200).json({
                        status: 1,
                        message: "Data found!",
                        data: data
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'Data not found!'
                    });
                }
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'All Field Required'
            });
        }
    });
};

exports.save_mr_otp_data = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "user_id": "required",
        "mr_otp_sent": "required",
        "mr_otp_created_at": "required",
        "mr_otp_expires_on": "required",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            let sql = 'select * from user where type=1 and id =' + body.user_id;
            connectPool.query(sql, (error, results, fields) => {
                if (error) {
                    return res.status(200).json({
                        status: 0,
                        message: error
                    });
                }
                if (results.length > 0) {
                    var fieldsToUpdate = {};
                    fieldsToUpdate['mr_otp_sent'] = body.mr_otp_sent;
                    fieldsToUpdate['mr_otp_created_at'] = body.mr_otp_created_at;
                    fieldsToUpdate['mr_otp_expires_on'] = body.mr_otp_expires_on;
                    var sqlupdate = 'UPDATE user SET ? WHERE type=1 AND id  = ' + body.user_id;
                    connectPool.query(sqlupdate, fieldsToUpdate, function(error, results) {
                        if (error) {
                            return res.status(200).json({
                                status: 0,
                                message: error
                            });
                        }
                        return res.status(200).json({
                            status: 1,
                            message: "MR OTP data has been updated successfully!",
                        });
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'Data not found!'
                    });
                }
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'All Field Required'
            });
        }
    });
};

exports.delete_doctor_profile_docs = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "user_id": "required",
        "document_id": "required"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            let sql = 'select * from user where type=2 and id =' + body.user_id;
            connectPool.query(sql, (error, results, fields) => {
                if (error) {
                    return res.status(200).json({
                        status: 0,
                        message: error
                    });
                }
                if (results.length > 0) {
                    const sqlFetch = 'SELECT * FROM `doctor_profile_verification` WHERE user_id = ' + body.user_id + ' AND id = ' + body.document_id;
                    connectPool.query(sqlFetch, function(errorFetch, resultFetch) {
                        if(errorFetch){
                            return res.status(200).json({
                                status: 0,
                                message: errorFetch
                            });
                        }
                        if(resultFetch.length > 0){
                            const sqlDelete = 'DELETE FROM `doctor_profile_verification` WHERE user_id = ' + body.user_id + ' AND id = ' + body.document_id;
                            connectPool.query(sqlDelete, function(errorDel, resultDel) {
                                if(errorDel){
                                    return res.status(200).json({
                                        status: 0,
                                        message: errorDel
                                    });
                                }
                                for (var x = 0; x < resultFetch.length; x++) {
                                    var imagePath = 'public/upload/user/'+resultFetch[x].document;
                                    if (fs.existsSync(imagePath)) {
                                        fs.unlinkSync(imagePath);
                                    }
                                }
                                
                                // Check any docs remaining
                                const sqlDocFetch = 'SELECT * FROM `doctor_profile_verification` WHERE user_id = ' + body.user_id;
                                connectPool.query(sqlDocFetch, function(errorDocFetch, resultDocFetch) {
                                    if(errorDocFetch){
                                        return res.status(200).json({
                                            status: 0,
                                            message: errorDocFetch
                                        });
                                    }
                                    let isNoDocs = 0;
                                    if(resultDocFetch.length <= 0){
                                        isNoDocs = 1;
                                        var fieldsToUpdate = {};
                                        fieldsToUpdate['verification_status_by_admin'] = 0;
                                        var sqlupdate = 'UPDATE user SET ? WHERE id  = ' + body.user_id;
                                        connectPool.query(sqlupdate, fieldsToUpdate, function(error, results) {
                                            if (error) {
                                                return res.status(200).json({
                                                    status: 0,
                                                    message: error
                                                });
                                            }
                                            var docResults = [];
                                            arr = {};
                                            arr['is_no_docs'] = isNoDocs;
                                            docResults.push(arr);
                                            return res.status(200).json({
                                                status: 1,
                                                message: "Documents has been deleted successfully!",
                                                data: docResults
                                            });
                                        });
                                    }else{
                                        var docResults = [];
                                        arr = {};
                                        arr['is_no_docs'] = isNoDocs;
                                        docResults.push(arr);
                                        return res.status(200).json({
                                            status: 1,
                                            message: "Documents has been deleted successfully!",
                                            data: docResults
                                        });
                                    }
                                });
                            });
                        }else{
                            return res.status(200).json({
                                status: 0,
                                message: 'No Docs Found!'
                            });
                        }
                    });
                } else {
                    return res.status(200).json({
                        status: 0,
                        message: 'Data not found!'
                    });
                }
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: 'All Field Required'
            });
        }
    });
};