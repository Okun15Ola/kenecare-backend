var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kenecare1@gmail.com', // jj250492@gmail.com
        pass: 'vofqjgehxhtidvrv' // zaojmurlbltvkcxd
    }
});

module.exports = transporter;