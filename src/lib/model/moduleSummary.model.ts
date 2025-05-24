import mongoose from "mongoose";


const moduleSummarySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    name : {
        type: String,
        required: true,
    },
    course_id : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course',
        required : true,
    },
    media : [{
        type: String, 
        validate: {
            validator: function(v: string) {
                return /^(https?:\/\/)?.+\..+/.test(v);
            },
            message: 'Please enter a valid URL'
        }
    }]
}, { 
    timestamps: true,
});



const ModuleSummary = mongoose.models.ModuleSummary || mongoose.model("ModuleSummary", moduleSummarySchema);

export default ModuleSummary;