const { query } = require("./db.connection");
const queries = require("./queries/payments.queries");

exports.getAllAppointmentPayments = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_APPOINTMENT_PAYMENTS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getAppointmentPaymentById = async (paymentId) => {
  return query(queries.GET_APPOINTMENT_PAYMENT_BY_ID, [paymentId]);
};

exports.createAppointmentPayment = async ({
  appointmentId,
  amountPaid,
  paymentMethod,
  orderId,
  paymentToken,
  notificationToken,
  transactionId,
}) => {
  return query(queries.CREATE_APPOINTMENT_PAYMENT, [
    appointmentId,
    amountPaid,
    paymentMethod,
    orderId,
    paymentToken,
    notificationToken,
    transactionId,
  ]);
};

exports.createFirstAppointmentPayment = async ({
  appointmentId,
  amountPaid,
  paymentMethod,
  orderId,
  transactionId,
  paymentToken,
  notificationToken,
  status,
}) => {
  return query(queries.CREATE_FIRST_APPOINTMENT_PAYMENT, [
    appointmentId,
    amountPaid,
    paymentMethod,
    orderId,
    transactionId,
    paymentToken,
    notificationToken,
    status,
  ]);
};

exports.updateAppointmentPaymentStatus = async ({
  paymentId,
  paymentStatus,
  transactionId,
}) => {
  return query(queries.UPDATE_APPOINTMENT_PAYMENT_STATUS, [
    paymentStatus,
    transactionId,
    paymentId,
  ]);
};

// exports.updateAppointmentPaymentByAppointmentId = async (appointmentId) => {
//   return query(queries.UPDATE_APPOINTMENT_PAYMENT_BY_APPOINTMENT_ID, [appointmentId]);
// };

exports.getAppointmentPaymentByOrderId = async (orderId) => {
  return query(queries.GET_APPOINTMENT_PAYMENT_BY_ORDER_ID, [orderId]);
};

exports.getAppointmentPaymentByPaymentToken = async (paymentToken) => {
  const result = await query(queries.GET_APPOINTMENT_PAYMENT_BY_PAYMENT_TOKEN, [
    paymentToken,
  ]);
  return result[0];
};

exports.getAppointmentPaymentByAppointmentId = async (appointmentId) => {
  const result = await query(
    queries.GET_APPOINTMENT_PAYMENT_BY_APPOINTMENT_ID,
    [appointmentId],
  );
  return result[0];
};

exports.getAppointmentPaymentsByStatus = async (paymentStatus) => {
  return query(queries.GET_APPOINTMENT_PAYMENTS_BY_STATUS, [paymentStatus]);
};

exports.getPaymentStatusByAppointmentId = async (appointmentId) => {
  const row = await query(
    queries.GET_APPOINTMENT_PAYMENT_STATUS_BY_APPOINTMENT_ID,
    [appointmentId],
  );
  return row[0];
};

exports.deleteAppointmentPaymentByAppointmentId = async ({ appointmentId }) => {
  return query(queries.DELETE_APPOINTMENT_PAYMENT_BY_APPOINTMENT_ID, [
    appointmentId,
  ]);
};
