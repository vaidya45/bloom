import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

// Copied from index.ts nodemailer
// changes @types as well for NotificationType
const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_WAITLIST: 'CHANGE_OF_WAITLIST',
    CHANGE_OF_HOLDFILE: 'CHANGE_OF_HOLDFILE',
    CHANGE_OF_OPEN_SEAT: 'CHANGE_OF_OPEN_SEAT',
    WAITLIST_THRESHOLD_MET: 'WAITLIST_THRESHOLD_MET',
    SECTION_DELETED: 'SECTION_DELETED',
};

export const sendEmailForSections = async (
    course: any,
) => {

    // Traversing each updated section
    for (const updatedSection of course.sections) {

        let emailNotifType: keyof typeof Notification;

        if (updatedSection.waitlistHistory.length < 2) {
            console.log("The course did not have sufficient waitlist history!");
            continue;
        } else if (updatedSection.openSeatHistory.length < 2) {
            console.log("The course did not have sufficient open seat history!");
            continue;
        } else if (updatedSection.holdFileHistory.length < 2) {
            console.log("The course did not have sufficient holdfile history!");
            continue;
            // Waitlist was updated
        } else if (updatedSection.waitlistHistory[updatedSection.waitlistHistory.length - 1].waitlistCount !==
            updatedSection.waitlistHistory[updatedSection.waitlistHistory.length - 2].waitlistCount) {
            emailNotifType = Notification.CHANGE_OF_WAITLIST as keyof typeof Notification;
            // Open Seat updated
        } else if (updatedSection.openSeatHistory[updatedSection.openSeatHistory.length - 1].openCount !==
            updatedSection.openSeatHistory[updatedSection.openSeatHistory.length - 2].openCount) {
            emailNotifType = Notification.CHANGE_OF_OPEN_SEAT as keyof typeof Notification;
            // Holdfile has updated
        } else if (updatedSection.holdFileHistory[updatedSection.holdFileHistory.length - 1].holdFileCount !==
            updatedSection.holdFileHistory[updatedSection.holdFileHistory.length - 2].holdFileCount) {
            emailNotifType = Notification.CHANGE_OF_HOLDFILE as keyof typeof Notification;
        } else {
            // No changes, skip sending email
            console.log("No change was detected when making CRON request");
            continue;
        }

        const courseInfo = {
            name: course.name,
            title: course.title,
            sectionNumber: updatedSection.sectionId,
            waitlistCount: updatedSection.waitlistHistory[updatedSection.waitlistHistory.length - 1].waitlistCount,
            openCount: updatedSection.openSeatHistory[updatedSection.openSeatHistory.length - 1].openCount,
            holdFileCount: updatedSection.holdFileHistory[updatedSection.holdFileHistory.length - 1].holdFileCount,
        };

        const emailContent = await generateEmailBody(courseInfo, emailNotifType);
        const userEmails = updatedSection.users.map((user: any) => user.email);
        await sendEmail(emailContent, userEmails);
    }
};
