const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var fs = require("fs");
const axios = require("axios").default;

exports.createWebPayment = (req, res, next) => {
  const { body } = req;
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  axios
    .post(process.env.ORANGEPAY_AUTH_API_BASE_URL + "/token", params, {
      headers: {
        Authorization: "Basic " + process.env.ORANGEPAY_AUTH_TOKEN,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then(function (response) {
      console.log("OM Auth Token Response: ", response.data);
      const api_response = response.data;
      const order_id = "KC" + Math.floor(Math.random() * 1000000000);
      const urlObject = new URL(FRONTEND_URL);
      const refHostName = urlObject.hostname;
      const payload = {
        merchant_key: process.env.ORANGEPAY_API_MERCHANT_KEY,
        currency: "SLE", // Use "OUV" for testing
        order_id: order_id,
        amount: body.amount,
        // "return_url": BASE_URL+"om_return",
        // "cancel_url": BASE_URL+"om_cancel",
        // "notif_url": BASE_URL+"om_notif",
        return_url:
          API_BASE_URL +
          "om_return?order_id=" +
          order_id +
          "&uid=" +
          body.user_id +
          "&returnOnCart=1&referrer=" +
          refHostName,
        cancel_url:
          API_BASE_URL +
          "om_cancel?order_id=" +
          order_id +
          "&uid=" +
          body.user_id,
        notif_url:
          API_BASE_URL +
          "om_notif?order_id=" +
          order_id +
          "&uid=" +
          body.user_id +
          "&returnOnCart=1&referrer=" +
          refHostName,
        lang: "en",
      };
      axios
        .post(process.env.ORANGEPAY_API_BASE_URL + "/webpayment", payload, {
          headers: {
            Authorization: "Bearer " + api_response.access_token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
        .then(function (response) {
          console.log("OM Auth Web Payment Response: ", response.data);
          const api_response = response.data;

          var bookingArr = {};
          bookingArr = body.booking_data;
          let sqlInsert =
            "INSERT INTO payments SET user_id = " +
            body.user_id +
            ", booking_type = " +
            body.booking_type +
            ", order_id = '" +
            order_id +
            "', payment_token = '" +
            api_response.pay_token +
            "', amount = " +
            body.amount +
            ", booking_data = " +
            JSON.stringify(bookingArr);
          connectPool.query(sqlInsert, (insError, insResults, insFields) => {
            if (insError) {
              return res.status(200).json({
                status: 0,
                message: insError,
              });
            }
            id = insResults.insertId;
            var data = [];
            arr = {};
            // arr['pay_token'] = api_response.pay_token;
            arr["payment_url"] = api_response.payment_url;
            // arr['notif_token'] = api_response.notif_token;
            data.push(arr);
            return res.status(200).json({
              status: 1,
              message: "Success!",
              data: data,
            });
          });
        })
        .catch(function (error) {
          console.log(
            "OM Auth Web Payment Error: ",
            error.response.data.description
          );
          return res.status(200).json({
            status: 0,
            message:
              typeof error.response !== "undefined"
                ? error.response.data.message
                : "Something went wrong.",
          });
        });
    })
    .catch(function (error) {
      console.log("OM Auth Token Error: ", error);
      return res.status(200).json({
        status: 0,
        message: error.response.data.error_description,
      });
    });
};

exports.om_return = (req, res, next) => {
  const { order_id, uid } = req.query;
  console.log("OM web payment return data: ", req.query);
  var sql =
    "SELECT * FROM payments WHERE user_id = " +
    uid +
    ' AND order_id = "' +
    order_id +
    '" LIMIT 1';
  connectPool.query(sql, (error, results, fields) => {
    if (error) {
      console.log("OM web payment return DB error", error.sqlMessage);
      var callback_status = "UNKNOWN";
      var err_msg = "DB error occurred. Please contact to your administrator";
      return res.redirect(
        FRONTEND_URL +
          "payment-callback?status=" +
          callback_status +
          "&error=1&is_booked=0&err_msg=" +
          err_msg
      );
    }
    if (results.length > 0) {
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      axios
        .post(process.env.ORANGEPAY_AUTH_API_BASE_URL + "/token", params, {
          headers: {
            Authorization: "Basic " + process.env.ORANGEPAY_AUTH_TOKEN,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then(function (token_response) {
          console.log("OM Auth Token Response: ", token_response.data);
          const api_response_token = token_response.data;
          const payload = {
            order_id: order_id,
            amount: results[0].amount,
            pay_token: results[0].payment_token,
          };
          axios
            .post(
              process.env.ORANGEPAY_API_BASE_URL + "/transactionstatus",
              payload,
              {
                headers: {
                  Authorization: "Bearer " + api_response_token.access_token,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            )
            .then(function (txn_response) {
              console.log("OM Auth Web Payment Response: ", txn_response.data);
              const api_response = txn_response.data;

              if (api_response.status == "SUCCESS") {
                // Save appointment data start
                var resultArray = Object.values(
                  JSON.parse(JSON.stringify(results))
                );
                var aptData = JSON.parse(resultArray[0].booking_data);
                // console.log('results booking_data: ', resultArray[0].booking_data);
                // console.log('results: ', JSON.parse(resultArray[0].booking_data).doctor_specialty);

                let sqlUser =
                  "select * from user where type=2 and id =" +
                  aptData.doctor_id;
                connectPool.query(
                  sqlUser,
                  (sqlUserError, sqlUserResults, sqlUserFields) => {
                    if (sqlUserError) {
                      console.log(
                        "OM web payment return DB error2",
                        sqlUserError.sqlMessage
                      );

                      var err_msg =
                        "DB error occurred. Please contact to your administrator";
                      return res.redirect(
                        FRONTEND_URL +
                          "payment-callback?status=" +
                          api_response.status +
                          "&error=1&is_booked=0&err_msg=" +
                          err_msg
                      );
                    }
                    if (sqlUserResults.length > 0) {
                      if (results[0].booking_type == 3) {
                        var sqlInsertApt =
                          "INSERT INTO video_consultation SET user_id = " +
                          aptData.user_id +
                          ", doctor_id = " +
                          aptData.doctor_id +
                          ', symptoms = "' +
                          aptData.symptoms +
                          '", specialty = ' +
                          aptData.specialty +
                          ', mobile_no = "' +
                          aptData.mobile_no +
                          '", patient_name = "' +
                          aptData.patient_name +
                          '", consultation_fee = ' +
                          aptData.consultation_fee;
                      } else {
                        var start_time = aptData.selected_slot;
                        const start_time_arr = start_time.split(":", 3);
                        var end_time =
                          parseInt(start_time_arr[0]) +
                          1 +
                          ":" +
                          start_time_arr[1] +
                          ":" +
                          start_time_arr[2];

                        var sqlInsertApt =
                          "INSERT INTO appointment SET user_id = " +
                          aptData.user_id +
                          ", doctor_id = " +
                          aptData.doctor_id +
                          ', symptoms = "' +
                          aptData.symptoms +
                          '", specialty = ' +
                          aptData.specialty +
                          ', mobile_no = "' +
                          aptData.mobile_no +
                          '", appointment_date = "' +
                          aptData.appointment_date +
                          '", patient_name = "' +
                          aptData.patient_name +
                          '", start_time = "' +
                          start_time +
                          '", end_time = "' +
                          end_time +
                          '", consultation_fee = ' +
                          aptData.consultation_fee +
                          ", booking_type = " +
                          aptData.booking_type;
                      }
                      connectPool.query(
                        sqlInsertApt,
                        (insAptError, insAptResults, insAptFields) => {
                          if (insAptError) {
                            console.log(
                              "OM web payment return DB error3",
                              insAptError.sqlMessage
                            );
                            var err_msg =
                              "DB error occurred. Please contact to your administrator";
                            return res.redirect(
                              FRONTEND_URL +
                                "payment-callback?status=" +
                                api_response.status +
                                "&error=1&is_booked=0&err_msg=" +
                                err_msg
                            );
                          }
                          var booking_id = insAptResults.insertId;
                          let sqlUpdate =
                            "UPDATE payments SET booking_id = " +
                            booking_id +
                            ', txnid = "' +
                            api_response.txnid +
                            '", payment_status = "' +
                            api_response.status +
                            '" WHERE id = ' +
                            results[0].id;
                          connectPool.query(
                            sqlUpdate,
                            (updError, updResults, updFields) => {
                              if (updError) {
                                console.log(
                                  "OM web payment return DB error4",
                                  updError.sqlMessage
                                );
                                var err_msg =
                                  "DB error occurred. Please contact to your administrator";
                                return res.redirect(
                                  FRONTEND_URL +
                                    "payment-callback?status=" +
                                    api_response.status +
                                    "&error=1&is_booked=0&err_msg=" +
                                    err_msg
                                );
                              }
                              return res.redirect(
                                FRONTEND_URL +
                                  "payment-callback?status=" +
                                  api_response.status +
                                  "&error=0&is_booked=1"
                              );
                            }
                          );
                        }
                      );
                    } else {
                      console.log(
                        "OM web payment return DB error5",
                        "Data not found."
                      );
                      var err_msg = "User not found";
                      return res.redirect(
                        FRONTEND_URL +
                          "payment-callback?status=" +
                          api_response.status +
                          "&error=1&is_booked=0&err_msg=" +
                          err_msg
                      );
                    }
                  }
                );
                // Save appointment data end
              } else {
                console.log(
                  "OM Auth Web Payment Status: ",
                  api_response.status
                );
                var callback_status = "UNKNOWN";
                var err_msg = "Transaction is not completed";
                return res.redirect(
                  FRONTEND_URL +
                    "payment-callback?status=" +
                    callback_status +
                    "&error=1&is_booked=0&err_msg=" +
                    err_msg
                );
              }
            })
            .catch(function (error) {
              console.log(
                "OM Auth Web Payment Error: ",
                error.response.data.description
              );
              var callback_status = "UNKNOWN";
              var err_msg = error.response.data.description;
              return res.redirect(
                FRONTEND_URL +
                  "payment-callback?status=" +
                  callback_status +
                  "&error=1&is_booked=0&err_msg=" +
                  err_msg
              );
            });
        })
        .catch(function (error) {
          console.log(
            "OM Auth Token Error: ",
            typeof error.response !== "undefined"
              ? error.response.data.error_description
              : "Something went wrong."
          );
          var callback_status = "UNKNOWN";
          var err_msg = "Payment authentication failed";
          return res.redirect(
            FRONTEND_URL +
              "payment-callback?status=" +
              callback_status +
              "&error=1&is_booked=0&err_msg=" +
              err_msg
          );
        });
    } else {
      console.log("Data not found!");
      var callback_status = "UNKNOWN";
      var err_msg = "Payment data not found";
      return res.redirect(
        FRONTEND_URL +
          "payment-callback?status=" +
          callback_status +
          "&error=1&is_booked=0&err_msg=" +
          err_msg
      );
    }
  });
};

exports.om_cancel = (req, res, next) => {
  const { order_id, uid } = req.query;
  console.log("OM web payment cancel data: ", req.query);
  var sql =
    "SELECT * FROM payments WHERE user_id = " +
    uid +
    ' AND order_id = "' +
    order_id +
    '" LIMIT 1';
  connectPool.query(sql, (error, results, fields) => {
    if (error) {
      console.log("OM web payment cancel DB error", error.sqlMessage);
      var callback_status = "UNKNOWN";
      var err_msg = "DB error occurred. Please contact to your administrator";
      return res.redirect(
        FRONTEND_URL +
          "payment-callback?status=" +
          callback_status +
          "&error=1&is_booked=0&err_msg=" +
          err_msg
      );
    }
    if (results.length > 0) {
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      axios
        .post(process.env.ORANGEPAY_AUTH_API_BASE_URL + "/token", params, {
          headers: {
            Authorization: "Basic " + process.env.ORANGEPAY_AUTH_TOKEN,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then(function (token_response) {
          console.log("OM Auth Token Response: ", token_response.data);
          const api_response_token = token_response.data;
          const payload = {
            order_id: order_id,
            amount: results[0].amount,
            pay_token: results[0].payment_token,
          };
          axios
            .post(
              process.env.ORANGEPAY_API_BASE_URL + "/transactionstatus",
              payload,
              {
                headers: {
                  Authorization: "Bearer " + api_response_token.access_token,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            )
            .then(function (txn_response) {
              console.log("OM Auth Web Payment Response: ", txn_response.data);
              const api_response = txn_response.data;

              let sqlInsert =
                'UPDATE payments SET txnid = "' +
                api_response.txnid +
                '", payment_status = "' +
                api_response.status +
                '" WHERE id = ' +
                results[0].id;
              connectPool.query(
                sqlInsert,
                (insError, insResults, insFields) => {
                  if (insError) {
                    console.log(
                      "OM web payment cancel DB error",
                      insError.sqlMessage
                    );
                    var callback_status = "UNKNOWN";
                    var err_msg =
                      "DB error occurred. Please contact to your administrator";
                    return res.redirect(
                      FRONTEND_URL +
                        "payment-callback?status=" +
                        callback_status +
                        "&error=1&is_booked=0&err_msg=" +
                        err_msg
                    );
                  }
                  id = insResults.insertId;
                  return res.redirect(
                    FRONTEND_URL +
                      "payment-callback?status=" +
                      api_response.status +
                      "&error=0&is_booked=0"
                  );
                }
              );
            })
            .catch(function (error) {
              console.log(
                "OM Auth Web Payment Error: ",
                error.response.data.description
              );
              var callback_status = "UNKNOWN";
              var err_msg = error.response.data.description;
              return res.redirect(
                FRONTEND_URL +
                  "payment-callback?status=" +
                  callback_status +
                  "&error=1&is_booked=0&err_msg=" +
                  err_msg
              );
            });
        })
        .catch(function (error) {
          console.log("OM Auth Token Error: ", error);
          var callback_status = "UNKNOWN";
          var err_msg = "Payment authentication failed";
          return res.redirect(
            FRONTEND_URL +
              "payment-callback?status=" +
              callback_status +
              "&error=1&is_booked=0&err_msg=" +
              err_msg
          );
        });
    } else {
      console.log("Data not found!");
      var callback_status = "UNKNOWN";
      var err_msg = "Payment data not found";
      return res.redirect(
        FRONTEND_URL +
          "payment-callback?status=" +
          callback_status +
          "&error=1&is_booked=0&err_msg=" +
          err_msg
      );
    }
  });
};

exports.om_notif = (req, res, next) => {
  const { order_id, uid } = req.query;
  console.log("OM web payment notif data: ", req.query);
  var sql =
    "SELECT * FROM payments WHERE user_id = " +
    uid +
    ' AND order_id = "' +
    order_id +
    '" LIMIT 1';
  connectPool.query(sql, (error, results, fields) => {
    if (error) {
      console.log("OM web payment notif DB error", error.sqlMessage);

      var callback_status = "UNKNOWN";
      var err_msg = "DB error occurred. Please contact to your administrator";
      return res.redirect(
        FRONTEND_URL +
          "payment-callback?status=" +
          callback_status +
          "&error=1&is_booked=0&err_msg=" +
          err_msg
      );
    }
    if (results.length > 0) {
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      axios
        .post(process.env.ORANGEPAY_AUTH_API_BASE_URL + "/token", params, {
          headers: {
            Authorization: "Basic " + process.env.ORANGEPAY_AUTH_TOKEN,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then(function (token_response) {
          console.log("OM Auth Token notif Response: ", token_response.data);
          const api_response_token = token_response.data;
          const payload = {
            order_id: order_id,
            amount: results[0].amount,
            pay_token: results[0].payment_token,
          };
          axios
            .post(
              process.env.ORANGEPAY_API_BASE_URL + "/transactionstatus",
              payload,
              {
                headers: {
                  Authorization: "Bearer " + api_response_token.access_token,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            )
            .then(function (txn_response) {
              console.log(
                "OM Auth Web Payment notif Response: ",
                txn_response.data
              );
              const api_response = txn_response.data;

              // Save appointment data start
              var resultArray = Object.values(
                JSON.parse(JSON.stringify(results))
              );
              var aptData = JSON.parse(resultArray[0].booking_data);
              // console.log('results booking_data: ', resultArray[0].booking_data);
              // console.log('results: ', JSON.parse(resultArray[0].booking_data).doctor_specialty);

              let sqlUser =
                "select * from user where type=2 and id =" + aptData.doctor_id;
              connectPool.query(
                sqlUser,
                (sqlUserError, sqlUserResults, sqlUserFields) => {
                  if (sqlUserError) {
                    console.log(
                      "OM web payment notif DB error2",
                      sqlUserError.sqlMessage
                    );
                    var err_msg =
                      "DB error occurred. Please contact to your administrator";
                    return res.redirect(
                      FRONTEND_URL +
                        "payment-callback?status=" +
                        api_response.status +
                        "&error=1&is_booked=0&err_msg=" +
                        err_msg
                    );
                  }
                  if (sqlUserResults.length > 0) {
                    if (results[0].booking_type == 3) {
                      var sqlInsertApt =
                        "INSERT INTO video_consultation SET user_id = " +
                        aptData.user_id +
                        ", doctor_id = " +
                        aptData.doctor_id +
                        ', symptoms = "' +
                        aptData.symptoms +
                        '", specialty = ' +
                        aptData.specialty +
                        ', mobile_no = "' +
                        aptData.mobile_no +
                        '", patient_name = "' +
                        aptData.patient_name +
                        '", consultation_fee = ' +
                        aptData.consultation_fee;
                    } else {
                      var start_time = aptData.selected_slot;
                      const start_time_arr = start_time.split(":", 3);
                      var end_time =
                        parseInt(start_time_arr[0]) +
                        1 +
                        ":" +
                        start_time_arr[1] +
                        ":" +
                        start_time_arr[2];

                      var sqlInsertApt =
                        "INSERT INTO appointment SET user_id = " +
                        aptData.user_id +
                        ", doctor_id = " +
                        aptData.doctor_id +
                        ', symptoms = "' +
                        aptData.symptoms +
                        '", specialty = ' +
                        aptData.specialty +
                        ', mobile_no = "' +
                        aptData.mobile_no +
                        '", appointment_date = "' +
                        aptData.appointment_date +
                        '", patient_name = "' +
                        aptData.patient_name +
                        '", start_time = "' +
                        start_time +
                        '", end_time = "' +
                        end_time +
                        '", consultation_fee = ' +
                        aptData.consultation_fee +
                        ", booking_type = " +
                        aptData.booking_type;
                    }
                    connectPool.query(
                      sqlInsertApt,
                      (insAptError, insAptResults, insAptFields) => {
                        if (insAptError) {
                          console.log(
                            "OM web payment notif DB error3",
                            insAptError.sqlMessage
                          );
                          var err_msg =
                            "DB error occurred. Please contact to your administrator";
                          return res.redirect(
                            FRONTEND_URL +
                              "payment-callback?status=" +
                              api_response.status +
                              "&error=1&is_booked=0&err_msg=" +
                              err_msg
                          );
                        }
                        var booking_id = insAptResults.insertId;
                        let sqlUpdate =
                          "UPDATE payments SET booking_id = " +
                          booking_id +
                          ', txnid = "' +
                          api_response.txnid +
                          '", payment_status = "' +
                          api_response.status +
                          '" WHERE id = ' +
                          results[0].id;
                        connectPool.query(
                          sqlUpdate,
                          (updError, updResults, updFields) => {
                            if (updError) {
                              console.log(
                                "OM web payment notif DB error4",
                                updError.sqlMessage
                              );
                              var err_msg =
                                "DB error occurred. Please contact to your administrator";
                              return res.redirect(
                                FRONTEND_URL +
                                  "payment-callback?status=" +
                                  api_response.status +
                                  "&error=1&is_booked=0&err_msg=" +
                                  err_msg
                              );
                            }
                            return res.redirect(
                              FRONTEND_URL +
                                "payment-callback?status=" +
                                api_response.status +
                                "&error=0&is_booked=1"
                            );
                          }
                        );
                      }
                    );
                  } else {
                    console.log(
                      "OM web payment notif DB error5",
                      "Data not found."
                    );
                    var err_msg = "Data not found";
                    return res.redirect(
                      FRONTEND_URL +
                        "payment-callback?status=" +
                        api_response.status +
                        "&error=1&is_booked=0&err_msg=" +
                        err_msg
                    );
                  }
                }
              );
              // Save appointment data end
            })
            .catch(function (error) {
              console.log(
                "OM Auth Web Payment notif Error: ",
                error.response.data.description
              );
              var callback_status = "UNKNOWN";
              var err_msg = error.response.data.description;
              return res.redirect(
                FRONTEND_URL +
                  "payment-callback?status=" +
                  callback_status +
                  "&error=1&is_booked=0&err_msg=" +
                  err_msg
              );
            });
        })
        .catch(function (error) {
          console.log(
            "OM Auth Token notif Error: ",
            typeof error.response !== "undefined"
              ? error.response.data.error_description
              : "Something went wrong."
          );
          var callback_status = "UNKNOWN";
          var err_msg = "Payment authentication failed";
          return res.redirect(
            FRONTEND_URL +
              "payment-callback?status=" +
              callback_status +
              "&error=1&is_booked=0&err_msg=" +
              err_msg
          );
        });
    } else {
      console.log("notif: Data not found!");

      var callback_status = "UNKNOWN";
      var err_msg = "Payment data not found";
      return res.redirect(
        FRONTEND_URL +
          "payment-callback?status=" +
          callback_status +
          "&error=1&is_booked=0&err_msg=" +
          err_msg
      );
    }
  });
};
