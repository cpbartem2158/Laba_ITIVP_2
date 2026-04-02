window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

export const API_CONFIG = {
    openEdx: {
        url: process.env.OPEN_EDX_API_BASE_URL,
        apiKey: process.env.OPEN_EDX_API_KEY,
        endpoints: {
            courses: '/api/courses/v1/courses/',
            course: '/api/courses/v1/courses/:courseId/',
        }
    },
    coursera: {
        url: process.env.COURSERA_API_BASE_URL,
        apiKey: process.env.COURSERA_API_KEY,
        endpoints: {
            courses: '/api/courses/v1/courses/',
            course: '/api/courses/v1/courses/:courseId/',
        }
    }
}