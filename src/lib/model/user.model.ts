import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id : {
        type : String,
        required : true,
    },
    name: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: false,
    },
    avatar : {
        type : URL,
        required : false,
    },
    email : {
        type : String,
        required : false,
    },
    socials : {
        github : {
            type : URL,
            required : false,
        },
        x : {
            type : URL,
            required : false,
        },
        linkedin : {
            type : URL,
            required : false,
        }
    }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;


