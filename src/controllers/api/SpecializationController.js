const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var fs = require("fs");

exports.specialization = (req, res, next) => {
    const { body } = req;

    connectPool.query(
        "select * from specialization where status=1",
        (error, results, fields) => {
            if (results.length > 0) {
                if (error) {
                    return res.status(200).json({
                        status: 0,
                        message: error,
                    });
                }
                var data = [];
                var i = 0;
                for (var x = 0; x < results.length; x++) {
                    arr = {};
                    arr["id"] = results[x].id;
                    arr["name"] = results[x].name;
                    arr["image"] = results[x].image;
                    data.push(arr);
                    i++;
                }
                return res.status(200).json({
                    status: 1,
                    message: "Data found!",
                    data: data,
                });
            } else {
                return res.status(200).json({
                    status: 0,
                    message: "Data not found!",
                });
            }
        }
    );
};

exports.getAllocatedSpecialties = (req, res, next) => {
    const { body } = req;
    // let sql = "SELECT b.id, b.name FROM user a LEFT JOIN specialization b ON a.specialization_id = b.id WHERE b.status = 1 AND a.type = 2 GROUP BY b.id ORDER BY b.name ASC ";
    // console.log(sql);
    let sql = "SELECT id, name FROM specialization WHERE status = 1 ORDER BY name ASC ";
    connectPool.query(sql, (error, results, fields) => {
        if (error) {
            return res.status(200).json({
                status: 0,
                message: error,
            });
        }
        if (results.length > 0) {
            return res.status(200).json({
                status: 1,
                message: "Data found!",
                data: results,
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: "Data not found!",
            });
        }
    });
};

exports.getDoctorsBySpecialty = (req, res, next) => {
    var data = req.body;
    let sql = "SELECT a.id, a.name, b.name as specialty, a.consultation_fee, a.image as doctor_image FROM user a LEFT JOIN specialization b ON a.specialization_id = b.id WHERE a.type = 2 AND a.specialization_id = "+data.specialty+" ORDER BY a.id DESC ";
    connectPool.query(sql, (error, results, fields) => {
        if (error) {
            return res.status(200).json({
                status: 0,
                message: error,
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
                data: data,
            });
        } else {
            return res.status(200).json({
                status: 0,
                message: "Data not found!",
            });
        }
    });
};
