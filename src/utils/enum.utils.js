function Enum(baseEnum) {
  return new Proxy(baseEnum, {
    get(target, name) {
      if (!Object.hasOwn(baseEnum, name)) {
        throw new Error(`"${name}" value does not exist in this enum`);
      }
      return baseEnum[name];
    },
    set() {
      throw new Error("Cannot add a new value to this enum");
    },
  });
}

const USERTYPE = Enum({
  PATIENT: 1,
  DOCTOR: 2,
});

const STATUS = Enum({
  ACTIVE: 1,
  NOT_ACTIVE: 0,
});

const VERIFICATIONSTATUS = Enum({
  VERIFIED: 1,
  NOT_VERIFIED: 0,
});

const COMMON_PINS = [
  "0000",
  "1111",
  "2222",
  "3333",
  "4444",
  "5555",
  "6666",
  "7777",
  "8888",
  "9999",
];

const ERROR_CODES = Enum({
  PATIENT_PROFILE_NOT_FOUND: 1404,
  DOCTOR_PROFILE_NOT_FOUND: 2404,
});

const PAYMENT_PROVIDERS = Enum({
  ORANGE_MONEY: "m17",
  AFRI_MONEY: "m18",
});

const MOMO_PROVIDERS = Enum({
  ORANGE_MONEY: "orange_money",
  AFRI_MONEY: "afri_money",
});

const PAYMENT_METHOD = Enum({
  BANK: "bank",
  MOBILE_MONEY: "mobile_money",
});

module.exports = {
  USERTYPE,
  STATUS,
  VERIFICATIONSTATUS,
  COMMON_PINS,
  ERROR_CODES,
  PAYMENT_PROVIDERS,
  MOMO_PROVIDERS,
  PAYMENT_METHOD,
};
