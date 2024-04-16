const router = require("express").Router();
const { clientAppUrl } = require("../../../config/default.config");
const {
  cancelAppointmentPayment,
  processAppointmentPayment,
} = require("../../../services/payment.services");

console.log("payment", clientAppUrl);

router.get("/om/return", async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;

    const response = await processAppointmentPayment({
      consultationId,
      referrer,
    });

    const { statusCode } = response;

    if (statusCode === 304) {
      return res.redirect(clientAppUrl);
    } else if (statusCode === 400) {
      return res.redirect(`${clientAppUrl}/paymentFailure`);
    }

    return res.redirect(`${clientAppUrl}/paymentSuccess`);
  } catch (error) {
    next(error);
  }
});
router.get("/om/cancel", async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;

    const response = await cancelAppointmentPayment({
      consultationId,
      referrer,
    });
    const { statusCode } = response;

    if (statusCode === 304) {
      return res.redirect(clientAppUrl);
    }

    return res.redirect(`${clientAppUrl}/paymentFailure`);
  } catch (error) {
    next(error);
  }
});

router.post("/om/notification", async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;

    const response = await processAppointmentPayment({
      consultationId,
      referrer,
    });

    const { statusCode } = response;

    if (statusCode === 304) {
      return res.redirect(clientAppUrl);
    } else if (statusCode === 400) {
      return res.redirect(`${clientAppUrl}/paymentFailure`);
    }

    return res.redirect(`${clientAppUrl}/paymentSuccess`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// CREATE TABLE doctors_wallet(
//   wallet_id int auto_increment,
//   doctor_id int not null,
//   balance decimal(10, 2) default 0,
//   wallet_pin varchar(100),
//   created_at timestamp default current_timestamp,
//   updated_at timestamp default current_timestamp on update current_timestamp,

//   constraint pk_wallet_id primary key(wallet_id),
//   constraint fk_wallet_doctor foreign key (doctor_id) references doctors(doctor_id) on update cascade on delete cascade
// )
