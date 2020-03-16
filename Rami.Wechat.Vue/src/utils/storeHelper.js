import $cookies from 'js-cookie';
export default {
    /**
     * 设置localStorage
     * @param {*} key 
     * @param {*} val 
     */
    setLocal(key, val) {
        window.localStorage.setItem(key, val);
    },
    /**
     * 获取localStorage
     * @param {*} key 
     */
    getLocal(key) {
        return window.localStorage.getItem(key);
    },
    /**
     * 设置sessionStorage
     * @param {*} key 
     * @param {*} val 
     */
    setSession(key, val) {
        window.sessionStorage.setItem(key, val);
    },
    /**
     * 获取sessionStorage
     * @param {*} key 
     */
    getSession(key) {
        return window.sessionStorage.getItem(key);
    },
    /**
     * 设置Cookie
     * @param {*} key 
     * @param {*} val 
     */
    setCookie(key, val) {
        $cookies.set(key, val);
    },
    /**
     * 获取Cookie
     * @param {*} key 
     */
    getCookie(key) {
        return $cookies.get(key);
    },
    /**
     * 获取CookieJson
     * @param {*} key 
     */
    getCookieJson(key) {
        return $cookies.getJSON(key);
    }
}