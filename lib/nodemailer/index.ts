"use server"

import { EmailContent, EmailCourseInfo, NotificationType } from '@/types';
import nodemailer from 'nodemailer';

const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_WAITLIST: 'CHANGE_OF_WAITLIST',
    CHANGE_OF_HOLDFILE: 'CHANGE_OF_HOLDFILE',
    CHANGE_OF_OPEN_SEAT: 'CHANGE_OF_OPEN_SEAT',
    WAITLIST_THRESHOLD_MET: 'WAITLIST_THRESHOLD_MET',
    SECTION_DELETED: 'SECTION_DELETED',
};

export const generateEmailBody = async (course: EmailCourseInfo, type: NotificationType) => {
    const shortenedTitle = course.title.length > 20 ? `${course.title.substring(0, 20)}...` : course.title;

    let subject = '';
    let body = '';

    switch (type) {
        case Notification.WELCOME:
            subject = `Bloom: Confirmation - Tracking ${course.name}, Section: ${course.sectionNumber}`;
            body = `
                <p>You've expressed interest in the course "${course.title}" (${course.name}) with section number ${course.sectionNumber}. Here's some information about it:</p>
                <ul>
                    <li><strong>Course Name:</strong> ${course.name}</li>
                    <li><strong>Course Title:</strong> ${course.title}</li>
                    <li><strong>Section Number:</strong> ${course.sectionNumber}</li>
                    <li><strong>Waitlist Count:</strong> ${course.waitlistCount}</li>
                    <li><strong>Open Seats:</strong> ${course.openCount}</li>
                    <li><strong>Holdfile Count:</strong> ${course.holdFileCount == -1 ? "N/A" : course.holdFileCount}</li>
                </ul>
                <p>We're here to help you track and manage your courses efficiently. If you have any questions or need assistance, don't hesitate to reach out to us.</p>
                <p>Happy learning! 📚</p>
                <p>Best regards,</p>
                <p>The Bloom Team 🌸</p>
                <p>If you wish to unsubscribe from these notifications, click <a href="https://www.coursebloom.me/unsubscribe/?name=${course.name}&section=${course.sectionNumber}">here</a>.</p>
            `;
            break;

        case Notification.CHANGE_OF_WAITLIST:
            subject = `Bloom: Waitlist Update for ${course.name}`;
            body = `
                <p>We want to inform you about a recent change in the open seats for the course: ${course.name} (${course.title}).</p>
                <ul>
                    <li><strong>Section Number:</strong> ${course.sectionNumber}</li>
                    <li><strong>Previous Waitlist Count:</strong> ${course.prevWaitlistCount}</li>
                    <li><strong>Updated Waitlist Count:</strong> ${course.waitlistCount}</li>
                    <li><strong>Previous Open Seats:</strong> ${course.prevOpenCount}</li>
                    <li><strong>Updated Open Seats:</strong> ${course.openCount}</li>
                    <li><strong>Holdfile Count:</strong> ${course.holdFileCount == -1 ? "N/A" : course.holdFileCount}</li>
                </ul>
                <p>For any questions or concerns, feel free to reach out to us.</p>
                <p>Happy learning and onward with Bloom! 🌼</p>
                <p>Best regards,</p>
                <p>The Bloom Team</p>
                <p>If you wish to unsubscribe from these notifications, click <a href="https://www.coursebloom.me/unsubscribe/?name=${course.name}&section=${course.sectionNumber}">here</a>.</p>
            `;
            break;

        case Notification.CHANGE_OF_HOLDFILE:
            subject = `Bloom: Testudo Tracker - Holdfile Update for ${course.name}`;
            body = `
                <p>We want to inform you about a recent change in the holdfile status for the course: ${course.name} (${course.title}).</p>
                <ul>
                    <li><strong>Section Number:</strong> ${course.sectionNumber}</li>
                    <li><strong>Previous Holdfile Count:</strong> ${course.prevHoldFileCount == -1 ? "N/A" : course.prevHoldFileCount}</li>
                    <li><strong>Updated Holdfile Count:</strong> ${course.holdFileCount == -1 ? "N/A" : course.holdFileCount}</li>
                    <li><strong>Previous Waitlist Count:</strong> ${course.prevWaitlistCount}</li>
                    <li><strong>Updated Waitlist Count:</strong> ${course.waitlistCount}</li>
                    <li><strong>Previous Open Seats:</strong> ${course.prevOpenCount}</li>
                    <li><strong>Updated Open Seats:</strong> ${course.openCount}</li>
                </ul>
                <p>If you have any inquiries, please don't hesitate to contact us.</p>
                <p>Happy learning and onward with Bloom! 🌼</p>
                <p>Best regards,</p>
                <p>The Bloom Team</p>
                <p>If you wish to unsubscribe from these notifications, click <a href="https://www.coursebloom.me/unsubscribe/?name=${course.name}&section=${course.sectionNumber}">here</a>.</p>
            `;
            break;

        case Notification.SECTION_DELETED:
            subject = `Bloom: Section (${course.sectionNumber}) Deleted for ${course.name}`;
            body = `
                <p>We would like to inform you that the section you were tracking for the course ${course.name} (${course.title}) is no longer available.</p>
                <ul>
                    <li><strong>Section Number:</strong> ${course.sectionNumber}</li>
                </ul>
                <p>If you have any questions or concerns, please feel free to reach out to us for assistance.</p>
                <p>Happy learning and onward with Bloom! 🌼</p>
            `;
            break;

        case Notification.WAITLIST_THRESHOLD_MET:
            subject = `Waitlist Threshold Met for ${course.name}`;
            body = `
                <p>The waitlist threshold has been met for the course: ${course.name} (${course.title}).</p>
                <p>Please take necessary actions as soon as possible.</p>
            `;
            break;

        default:
            break;
    }

    return { subject, body };
};

const transporter = nodemailer.createTransport({
    pool: true,
    service: 'hotmail',
    port: 2525,
    auth: {
        user: 'bloom-update@outlook.com',
        pass: process.env.EMAIL_PASSWORD,
    },
    maxConnections: 1
});

export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {
    const mailOptions = {
        from: 'bloom-update@outlook.com',
        to: sendTo,
        html: emailContent.body,
        subject: emailContent.subject,
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            console.log("Email Sent: ", info);
            resolve(info);
        });
    });
}
