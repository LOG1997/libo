import request from '@/api/request';
export function getData(params: any) {
    return request({
        url: '/getData',
        method: 'get',
        params,
    });
}
export function postData(data: any) {
    return request({
        url: '/postData',
        method: 'post',
        data,
    });
}


export function getAnswer(data: any) {
    return request({
        url: '/api/getanswer',
        method: 'get',
        data,
    });
}

