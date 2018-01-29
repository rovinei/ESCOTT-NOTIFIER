const nodemailer = require('nodemailer');
const smtpConfig = {
    pool: true
    , maxConnections: 1000
    , host: 'smtp.gmail.com'
    , port: 587
    , secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.SENDER_MAIL
        , pass: process.env.MAIL_PASSWORD
    }
};
var htmlMailTemplate = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title></title>
        <style></style>
    </head>
    <body>
        <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
            <tr>
                <td align="center" valign="top">
                    <table border="0" cellpadding="20" cellspacing="0" width="600" id="emailContainer">
                        <tr>
                            <td align="center" valign="top">
                                <table border="1" cellpadding="20" cellspacing="0" width="100%" id="emailHeader">
                                    <tr>
                                        <td align="center" valign="top">
                                            <h1>Power and water usage consumption</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" valign="top">
                                <table border="1" cellpadding="20" cellspacing="0" width="100%" id="emailBody">
                                    <thead>
                                        <tr>
                                            <th align="center" valign="top">
                                                Current power usage
                                            </th>
                                            <th align="center" valign="top">
                                                Limitation of power usage
                                            </th>
                                            <th align="center" valign="top">
                                                Total over usage
                                            </th>
                                        </tr>
                                    </thead>
                                    <tr>
                                        <td align="center" valign="top">
                                            {0}
                                        </td>
                                        <td align="center" valign="top">
                                            {1}
                                        </td>
                                        <td align="center" valign="top">
                                            {2}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" valign="top">
                                <table border="1" cellpadding="20" cellspacing="0" width="100%" id="emailBody">
                                    <thead>
                                        <tr>
                                            <th align="center" valign="top">
                                                Current water usage
                                            </th>
                                            <th align="center" valign="top">
                                                Limitation of water usage
                                            </th>
                                            <th align="center" valign="top">
                                                Total over usage
                                            </th>
                                        </tr>
                                    </thead>
                                    <tr>
                                        <td align="center" valign="top">
                                            {3}
                                        </td>
                                        <td align="center" valign="top">
                                            {4}
                                        </td>
                                        <td align="center" valign="top">
                                            {5}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;

function Mail() {
    this.mailTransporter = nodemailer.createTransport(smtpConfig);
}
Mail.prototype.formatHTML = function (string, values) {
    var args = values;
    return string.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}
Mail.prototype.sendMail = function (mailOptions) {
    var mailTransporter = this.mailTransporter;
    var mailMessage = mailOptions;
    console.log("MAILED");
    return new Promise(function (resolve, reject) {
        if (mailTransporter.isIdle()) {
            mailTransporter.sendMail(mailMessage, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(200);
                }
            });
        }
        else {
            resolve(201);
        }
    });
}
Mail.prototype.closeMailPoolConnection = function () {
    this.mailTransporter.close();
}
module.exports = {
    Mail: Mail
    , htmlMailTemplate: htmlMailTemplate
};