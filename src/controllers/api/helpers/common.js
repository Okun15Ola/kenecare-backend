var CryptoJS = require("crypto-js");
const commonService = {
    addMinutes: (time, minutes, aptDate, type = '') => {
        if (type === 'tomorrow') {
            var fullDate = new Date(aptDate);
            var dd = String(fullDate.getDate() + 1).padStart(2, '0');
        } else {
            fullDate = new Date(aptDate);
            var dd = String(fullDate.getDate()).padStart(2, '0');
        }
        var mm = String(fullDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = fullDate.getFullYear();

        fullDate = yyyy + '-' + mm + '-' + dd;

        var date = new Date(new Date(fullDate + ' ' + time).getTime() + minutes * 60000);
        var tempTime = ((date.getHours().toString().length === 1) ? '0' + date.getHours() : date.getHours()) + ':' +
            ((date.getMinutes().toString().length === 1) ? '0' + date.getMinutes() : date.getMinutes()) + ':' +
            ((date.getSeconds().toString().length === 1) ? '0' + date.getSeconds() : date.getSeconds());
        return tempTime;
    },
    getTimeSlots: (morning_start_time, morning_end_time, evening_start_time, evening_end_time, aptDate) => {
        var interval = process.env.TIME_SLOT_INTERVAL;

        // Today
        var mStartTime = morning_start_time.toString();
        var mEndTime = morning_end_time.toString();
        
        var eStartTime = evening_start_time.toString();
        var eEndTime = evening_end_time.toString();

        var morning_time_slots = [mStartTime];
        while (mStartTime !== mEndTime) {
            mStartTime = commonService.addMinutes(mStartTime, interval, aptDate);
            if (mStartTime !== mEndTime) {
                morning_time_slots.push(mStartTime);
            }
        }

        var evening_time_slots = [eStartTime];
        while (eStartTime !== eEndTime) {
            eStartTime = commonService.addMinutes(eStartTime, interval, aptDate);
            if (eStartTime !== eEndTime) {
                evening_time_slots.push(eStartTime);
            }
        }

        // Tomorrow
        var mStartTimeTom = morning_start_time.toString();
        var mEndTimeTom = morning_end_time.toString();
        
        var eStartTimeTom = evening_start_time.toString();
        var eEndTimeTom = evening_end_time.toString();

        var morning_time_slots_tom = [mStartTimeTom];
        while (mStartTimeTom !== mEndTimeTom) {
            mStartTimeTom = commonService.addMinutes(mStartTimeTom, interval, aptDate, 'tomorrow');
            if (mStartTimeTom !== mEndTimeTom) {
                morning_time_slots_tom.push(mStartTimeTom);
            }
        }

        var evening_time_slots_tom = [eStartTimeTom];
        while (eStartTimeTom !== eEndTimeTom) {
            eStartTimeTom = commonService.addMinutes(eStartTimeTom, interval, aptDate, 'tomorrow');
            if (eStartTimeTom !== eEndTimeTom) {
                evening_time_slots_tom.push(eStartTimeTom);
            }
        }
        // console.log('Morning Time Slots: ', morning_time_slots);
        // console.log('Evening Time Slots: ', evening_time_slots);
        // console.log('Morning Time Slots Tom: ', morning_time_slots_tom);
        // console.log('Evening Time Slots Tom: ', evening_time_slots_tom);
        return { 'morning_time_slots': morning_time_slots, 'evening_time_slots': evening_time_slots, 'morning_time_slots_tom': morning_time_slots_tom, 'evening_time_slots_tom': evening_time_slots_tom }
    },
    addHoursInSpecificTime: (numOfHours, date = new Date()) => {
        date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
        return date;
    },
    encrypt: (string) => {
        var encStr = CryptoJS.AES.encrypt(string, "kenecare_JDI").toString();
        let encrypted_string = encStr
          .replace("+", "xMl3Jk")
          .replace("/", "Por21Ld")
          .replace("=", "Ml32");
        return encrypted_string;
    },
    decrypt: (cipherText) => {
        cipherText = cipherText
        .toString()
        .replace("xMl3Jk", "+")
        .replace("Por21Ld", "/")
        .replace("Ml32", "=");
        var bytes = CryptoJS.AES.decrypt(cipherText, "kenecare_JDI");
        var decrypted_string = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted_string;
    },
    addSecondsInSpecificTime: (seconds, date_time) => {
        var date;
        date = new Date(date_time);

        var dd = String(date.getDate()).padStart(2, "0");
        var mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyy = String(date.getFullYear());
        var hh = String(date.getHours()).padStart(2, "0");
        date.setSeconds(date.getSeconds() + seconds);
        var ii = String(date.getMinutes()).padStart(2, "0");
        var ss = String(date.getSeconds()).padStart(2, "0");
        var fullDate = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + ii + ":" + ss;
        return fullDate;
    },
    currentDt: () => {
        const today = new Date();
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyy = String(today.getFullYear());
        var hh = String(today.getHours()).padStart(2, "0");
        var ii = String(today.getMinutes()).padStart(2, "0");
        var ss = String(today.getSeconds()).padStart(2, "0");
    
        var fullDate = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + ii + ":" + ss;
        return fullDate;
    },
    generateRandomString: (length) => {
        var result           = '';
        var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
};

module.exports = commonService;