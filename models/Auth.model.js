const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthSchema = new Schema({
    Auth_username: {
        type: String
    },
    Auth_email: {
        type: String
    },
    Auth_password: {
        type: String,
        required: true
    },
    Auth_role: {
        type: String,
        required: true
    },
    Auth_status: {
        type: String,
        required: true
    },
    Auth_created: {
        type: String,
    },
    Auth_history: {
        type: Array,
        "default": []
    },
    Auth_history_login: {
        type: Array,
        "default": []
    },
    Auth_detail: {
        type: Array,
        "default": []
    },
    Auth_domain: {
        type: String
    },
    Auth_still_logged: {
        type: String
    }
});

const AuthUser = mongoose.model('Auth', AuthSchema);

module.exports = AuthUser;