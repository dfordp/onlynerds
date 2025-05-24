import mongoose from "mongoose";


const moduleSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    name : {
        type: String,
        required: true,
    },
    content : {
        type: String,
        required: true,
    },
}, { 
    timestamps: true,
});


moduleSchema.index({ course_id: 1 });
moduleSchema.index({ course_id: 1, name: 1 });    

const Module = mongoose.models.Module || mongoose.model("Module", moduleSchema);

export default Module;