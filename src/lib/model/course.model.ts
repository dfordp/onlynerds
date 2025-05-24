import mongoose from "mongoose";


const courseSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: [2, 'Name must be at least 2 characters'],
        maxLength: [70, 'Name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, 'Bio cannot exceed 500 characters']
    },
    creator_id : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    isPublic : {
        type: Boolean, 
        required : true,
        default : true,
    },
    categories: [{
        type: String,
        enum: ['Web3', 'AI/ML', 'Full Stack Development', 'Marketing', 'Designs'],
        required: true
    }], 
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    isOriginal : {
        type: Boolean, 
        required : true,
        default : false,
    },
    forkedFrom : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course',
        required : false,
    }
}, { 
    timestamps: true,
});

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;