import mongoose from "mongoose";


const submissionSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    assessments_id : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Module',
        required : true,
    },
    summary : {
        type: String,
        required: true,
    },
}, { 
    timestamps: true,
});



const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

export default Submission;