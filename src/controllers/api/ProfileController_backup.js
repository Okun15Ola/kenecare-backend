const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
const { compareSync, hashSync, genSaltSync } = require("bcryptjs");
const { getTimeSlots } = require('./helpers/common');
var multer = require('multer');
var fs = require('fs');

exports.get_user_profile = (req, res, next) => {
    const { body } = req;
    const validationRule = {
        "user_id": "required",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
            var user_id = body.user_id;
            connectPool.query('select * from user where id =' + user_id, (error, results, fields) => {
                if (results.length > 0) {
                    if (error) {
                        return res.status(200).json({
                            status: 0,
                            message: error
                        });
                    }
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

                        let profile_status = 0;
                        if (data.name != '' && data.email != '' && (req.file != '' || results[0].image != '') && data.gender != '' && data.specialization_id != '' && data.position != '' && data.city_id != '' && data.registration_number != '' && data.registration_council_id != '' && data.registration_year != '' && data.degree_id != '' && data.college != '' && data.year_of_completion != '' && data.year_of_experience != '' && data.doc_morning_start_time != '' && data.doc_morning_end_time != '' && data.doc_evening_start_time != '' && data.doc_evening_end_time != '' && data.consultation_fee != '') {
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
                            return res.status(200).json({
                                status: 1,
                                message: "Profile has been updated successfully!",
                                profile_status: profile_status
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
                            const sqlDelete = 'DELETE FROM `doctor_profile_verification` WHERE user_id = ' + data.user_id;
                            connectPool.query(sqlDelete, function(errorDel, resultDel) {
                                fileKeys.forEach(function(key) {
                                    docFiles.push([data.user_id, req.files[key].filename]);
                                });
                                const sqlInsert = 'INSERT INTO `doctor_profile_verification` (`user_id`, `document`) VALUES ?';
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
                    connectPool.query('select id, document from doctor_profile_verification where user_id =' + user_id, (error1, results1, fields1) => {
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
                                arr['document'] = BASE_URL + 'public/upload/user/' + results1[x].document;
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
                    return res.status(200).json({
                        status: 1,
                        message: "Data found!",
                        data: results
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
                    console.log(sql1);
                    connectPool.query(sql1, (error1, results1, fields1) => {
                        /* var apt_data_today = [];
                        var i = 0;
                        for (var x = 0; x < results1.length; x++) {
                            todayArr = {};
                            todayArr = results1[x];
                            apt_data_today.push(todayArr);
                            i++;
                        } */
                        var today_appointments = results1;
                        
                        if(today_appointments.length > 0){
                            var tsMorArr = [];
                            for (var x1 = 0; x1 < results1.length; x1++) {
                                console.log(tsArr.morning_time_slots);
                                // Check Morning Slots
                                let today_available_ts = 0;

                                var arr1 = {};
                                if(tsArr.morning_time_slots.includes(results1[x1].start_time)){
                                    arr1['slot'] = results1[x1].start_time;
                                    arr1["is_booked"] = 1;
                                }else{
                                    arr1['slot'] = results1[x1].start_time;
                                    arr1["is_booked"] = 0;
                                    today_available_ts++;
                                }
                                tsMorArr.push(arr1);

                                /* tsArr.morning_time_slots.forEach(element1 => {
                                    // console.log('Element1: ',element1);
                                    // console.log('Element ST1: ',results1[x1].start_time);
                                    
                                    var arr1 = {};
                                    if(element1 === results1[x1].start_time){
                                        arr1['slot'] = element1;
                                        arr1["is_booked"] = 1;
                                    }else{
                                        arr1['slot'] = element1;
                                        arr1["is_booked"] = 0;
                                        today_available_ts++;
                                    }
                                    tsMorArr.push(arr1);
                                }); */
                                console.log('Mor Arr: ',tsMorArr);
    
                                // Check Evening Slots
                                var tsEveArr = [];
                                tsArr.evening_time_slots.forEach(element2 => {
                                    var arr2 = {};
                                    if((element2 == results1[x1].start_time)){
                                        arr2['slot'] = element2;
                                        arr2["is_booked"] = 1;
                                    }else{
                                        arr2['slot'] = element2;
                                        arr2["is_booked"] = 0;
                                        today_available_ts++;
                                    }
                                    tsEveArr.push(arr2);
                                });

                                var mor_eve_time_slots = [];
                                var mts = {};
                                mts['morning_time_slots'] = tsMorArr;
                                mor_eve_time_slots.push(mts);
                                var ets = {};
                                ets['evening_time_slots'] = tsEveArr;
                                mor_eve_time_slots.push(ets);
                                arr['time_slots'] = mor_eve_time_slots;
                                arr['today_available_time_slots'] = parseInt(today_available_ts);
                                // let mor_eve_time_slots = tsMorArr.concat(tsEveArr);
                            }
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
                            // console.log('Res: ', results2);
                            var apt_data_tomorrow = [];
                            if(results2.length > 0){
                                var i = 0;
                                for (var x = 0; x < results2.length; x++) {
                                    tomArr = {};
                                    tomArr = results2[x];
                                    apt_data_tomorrow.push(tomArr);
                                    i++;
                                }
                            }
                            var tomorrow_appointments = apt_data_tomorrow;
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