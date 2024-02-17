import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    link: { type: String, required: true },
    title: { type: String, required: true },
    sections: [
        {
            sectionId: { type: String, required: true },
            totalSeats: { type: String, required: true },
            instructor: { type: String, required: true },
            waitlistHistory: [
                {
                    waitlistCount: { type: Number, required: true },
                    date: { type: Date, default: Date.now }
                }
            ],
            openSeatHistory: [
                {
                    openCount: { type: Number, required: true },
                    date: { type: Date, default: Date.now }
                }
            ],
            holdFileHistory: [
                {
                    holdFileCount: { type: Number, required: true },
                    date: { type: Date, default: Date.now }
                }
            ],
            users: [
                { email: { type: String, required: true } },
            ], default: [],
        }
    ],

}, { timestamps: true });

const appDataSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    value: { type: Number, required: true }
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export const AppData = mongoose.models.AppData || mongoose.model('AppData', appDataSchema);

export default Course;
