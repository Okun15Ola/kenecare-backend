function Enum(baseEnum) {
  return new Proxy(baseEnum, {
    get(target, name) {
      if (!baseEnum.hasOwnProperty(name)) {
        throw new Error(`"${name}" value does not exist in this enum`);
      }
      return baseEnum[name];
    },
    set(target, name, value) {
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

module.exports = { USERTYPE, STATUS, VERIFICATIONSTATUS };
