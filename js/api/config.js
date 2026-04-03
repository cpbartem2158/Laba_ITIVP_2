window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

var API_CONFIG = {
    // openEdx: {
    //     url: 'https://courses.edx.org',
    //     apiKey: '',
    //     endpoints: {
    //         courses: '/api/courses/v1/courses/',
    //         course: '/api/courses/v1/courses/:courseId/',
    //     },
    // },
    edxProxy: {
        baseUrl: 'http://127.0.0.1:8000/api/edx/',
        apiKey: 'lab-api-key',
    },
};

Edu.API_CONFIG = API_CONFIG;
