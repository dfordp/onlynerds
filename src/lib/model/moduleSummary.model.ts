import mongoose from "mongoose";


const moduleSummarySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    module_id : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Module',
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
    }],
    summary : {
        type: String,
        required: true,
    },
}, { 
    timestamps: true,
});



const ModuleSummary = mongoose.models.ModuleSummary || mongoose.model("ModuleSummary", moduleSummarySchema);

export default ModuleSummary;