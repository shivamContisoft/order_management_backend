
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const dotEnv = require('dotenv');

dotEnv.config();

exports.sendResetPasswordEmail = function (password, userEmail) {
    let html_content = fs
        .readFileSync("./resources/email/reset-password.template.html", {
            encoding: "utf-8"
        })
        .toString();

    const replacements = {
        password: password
    }
    return sendEmail(html_content, replacements, userEmail);

}

async function sendEmail(html_content, replacements, toEmail, cc = [], bcc = []) {

    let transport = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'NoReply@triangularinfosolutions.com',
            pass: 'Tipl@1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var template = handlebars.compile(html_content);
    var htmlToSend = template(replacements);

    const message = {
        from: "Triangular <NoReply@triangularinfosolutions.com>", // Sender address
        to: toEmail,
        bcc: bcc,
        cc: cc,
        subject: "Triangular | Request for Reset Password", // Subject line
        html: htmlToSend // Plain text body
    };

    transport.sendMail(message, function (err, info) {
        if (err) {
            return false;
        }
        return true;
    });
}

exports.emailForNewAccount = function (userEmail, password) {
    console.log(userEmail, password, "111111111111111");
    let html_content = fs
        .readFileSync("./resources/email/newAccountCreditials-email.template.html", {
            encoding: "utf-8"
        })
        .toString();

    const replacements = {
        userEmail: userEmail,
        password: password
    }
    return emailsendForNewAccount(html_content, replacements, userEmail);

}

async function emailsendForNewAccount(html_content, replacements, toEmail, cc = [], bcc = []) {
    let transport = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'NoReply@triangularinfosolutions.com',
            pass: 'Tipl@1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var template = handlebars.compile(html_content);
    var htmlToSend = template(replacements);

    const message = {
        from: "Triangular <NoReply@triangularinfosolutions.com>", // Sender address
        to: toEmail,
        bcc: bcc,
        cc: cc,
        subject: "Triangular |Your new account credentials", // Subject line
        html: htmlToSend // Plain text body
    };

    transport.sendMail(message, function (err, info) {
        if (err) {
            console.log(err);
            return false;
        }
        return true;
    });
}

exports.approverEmail = function (firstName, lastName, userEmail, orderid,customerName,poNo,poValue, approverName) {
    let html_content = fs
        .readFileSync("./resources/email/approver-email.template.html", {
            encoding: "utf-8"
        })
        .toString();
    console.log(userEmail, "userEmailuserEmailuserEmailuserEmail");
    const replacements = {
        firstName: firstName,
        lastName: lastName,
        orderid: orderid,
        // productName:productName,
        customerName:customerName,
        poNo:poNo,
        poValue:poValue,
        

        approverName: approverName,
    }
    return sendApproverEmail(html_content, replacements, userEmail, orderid);

}

async function sendApproverEmail(html_content, replacements, toEmail, orderid, cc = [], bcc = []) {
    console.log(process.env);
    console.log(replacements, "replacementsreplacementsreplacementsreplacements");
    console.log(toEmail, "toEmailtoEmailtoEmailtoEmail");
    let transport = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'NoReply@triangularinfosolutions.com',
            pass: 'Tipl@1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var template = handlebars.compile(html_content);
    var htmlToSend = template(replacements);

    const message = {
        from: "Triangular <NoReply@triangularinfosolutions.com>", // Sender address
        to: toEmail,
        bcc: bcc,
        cc: cc,
        subject: "Triangular | Request for approve order Id: " + orderid, // Subject line
        html: htmlToSend // Plain text body
    };

    transport.sendMail(message, function (err, info) {
        if (err) {
            console.log(err);
            return false;
        }
        return true;
    });
}



exports.rejectEmail = function (firstName, lastName, userEmail,orderid, approverName,customerName,poNo,poValue ) {
    let html_content = fs
        .readFileSync("./resources/email/reject-email.template.html", {
            encoding: "utf-8"
        })
        .toString();

    const replacements = {
        firstName: firstName,
        lastName: lastName,
        order_id: orderid,
        approverName: approverName,
        // productName:productName,
        customerName:customerName,
        poNo:poNo,
        poValue:poValue,
    }
    return sendRejectedEmail(html_content, replacements, userEmail, orderid);

}

async function sendRejectedEmail(html_content, replacements, toEmail, orderid, cc = [], bcc = []) {

    let transport = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'NoReply@triangularinfosolutions.com',
            pass: 'Tipl@1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    var template = handlebars.compile(html_content);
    var htmlToSend = template(replacements);

    const message = {
        from: "Triangular <NoReply@triangularinfosolutions.com>", // Sender address
        to: toEmail,
        bcc: bcc,
        cc: cc,
        subject: "Triangular |" + orderid + " Order Rejected", // Subject line
        html: htmlToSend // Plain text body
    };

    transport.sendMail(message, function (err, info) {
        if (err) {
            return false;
        }
        return true;
    });
}

exports.emailgoestoNextstep = function (firstName, lastName, userEmail, orderid,approverName,customerName,poNo,poValue) {
    let html_content = fs
        .readFileSync("./resources/email/emailgoestoNextstep-email.template.html", {
            encoding: "utf-8"
        })
        .toString();

    const replacements = {
        firstName: firstName,
        lastName: lastName,
        orderid: orderid,
        approverName: approverName,
        // productName:productName,
        customerName:customerName,
        poNo:poNo,
        poValue:poValue,
        
    }
    return sendEmailgoestoNextstep(html_content, replacements, userEmail, orderid);

}

async function sendEmailgoestoNextstep(html_content, replacements, toEmail, orderid, cc = [], bcc = []) {

    let transport = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'NoReply@triangularinfosolutions.com',
            pass: 'Tipl@1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var template = handlebars.compile(html_content);
    var htmlToSend = template(replacements);

    const message = {
        from: "Triangular <NoReply@triangularinfosolutions.com>", // Sender address
        to: toEmail,
        bcc: bcc,
        cc: cc,
        subject: "Triangular |Order Id " + orderid + " is goes to next step", // Subject line
        html: htmlToSend // Plain text body
    };

    transport.sendMail(message, function (err, info) {
        if (err) {
            return false;
        }
        return true;
    });
}



exports.emailgoesToOrderOwner = function (firstName, lastName, userEmail, orderid,customerName,poNo,poValue, approverName) {
    let html_content = fs
        .readFileSync("./resources/email/emailgoesToOrderOwner-email.template.html", {
            encoding: "utf-8"
        })
        .toString();
console.log(customerName,"comapany Name ");
    const replacements = {
        firstName: firstName,
        lastName: lastName,
        orderid: orderid,
        // productName:productName,
        customerName:customerName,
        poNo:poNo,
        poValue:poValue,
    
        approverName: approverName,
    }
    return sendEmailgoesToOrderOwner(html_content, replacements, userEmail, orderid);

}

async function sendEmailgoesToOrderOwner(html_content, replacements, toEmail, orderid, cc = [], bcc = [],) {

    let transport = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'NoReply@triangularinfosolutions.com',
            pass: 'Tipl@1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var template = handlebars.compile(html_content);
    var htmlToSend = template(replacements);
    console.log(orderid, "orderidorderidorderid");

    const message = {
        from: "Triangular <NoReply@triangularinfosolutions.com>", // Sender address
        to: toEmail,
        bcc: bcc,
        cc: cc,
        subject: "Triangular |Order Id is: " + orderid, // Subject line
        html: htmlToSend // Plain text body
    };

    transport.sendMail(message, function (err, info) {
        if (err) {
            return false;
        }
        return true;
    });
}

exports.emailFullyApproved = function (firstName, lastName, userEmail, orderid,customerName,poNo,poValue, approverName) {
    let html_content = fs
        .readFileSync("./resources/email/emailFullyApproved-email.template.html", {
            encoding: "utf-8"
        })
        .toString();

    const replacements = {
        firstName: firstName,
        lastName: lastName,
        orderid: orderid,
        // productName:productName,
        customerName:customerName,
        poNo:poNo,
        poValue:poValue,

        // approverName:approverName,
    }
    return sendEmailFullyApproved(html_content, replacements, userEmail, orderid);

}

async function sendEmailFullyApproved(html_content, replacements, toEmail, orderid, cc = [], bcc = [],) {

    let transport = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'NoReply@triangularinfosolutions.com',
            pass: 'Tipl@1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var template = handlebars.compile(html_content);
    var htmlToSend = template(replacements);
    console.log(orderid, "orderidorderidorderid");

    const message = {
        from: "Triangular <NoReply@triangularinfosolutions.com>", // Sender address
        to: toEmail,
        bcc: bcc,
        cc: cc,
        subject: "Triangular |Order Id is: " + orderid, // Subject line
        html: htmlToSend // Plain text body
    };

    transport.sendMail(message, function (err, info) {
        if (err) {
            return false;
        }
        return true;
    });
}
