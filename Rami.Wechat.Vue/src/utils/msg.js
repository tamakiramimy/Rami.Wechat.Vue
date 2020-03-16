/**
 * 通用验证
 * @param {any} _this
 * @param {any} type
 * @param {any} prop
 * @param {any} erroMsg
 */
function checkSave(_this, type, prop, erroMsg) {
    if (type == 0) {
        // 字符串
        if (prop == null || prop.length == 0) {
            showMsg(_this, erroMsg);
            return false;
        }
    } else if (type == 1) {
        // 正数（大于0）
        if (prop == null || prop <= 0) {
            showMsg(_this, erroMsg);
            return false;
        }
    } else if (type == 2) {
        // 非负数
        if (prop == null || prop < 0) {
            showMsg(_this, erroMsg);
            return false;
        }
    } else if (type == 3) {
        // 手机
        var regExp = new RegExp(/^(0|86)?(13|14|15|16|17|18|19)[0-9]{9}$/);
        if (!regExp.test(prop)) {
            showMsg(_this, erroMsg);
            return false;
        }
    } else if (type == 4) {
        // 数字 必选
        if (prop == null || prop.toString().length == 0) {
            vm.showMsg(_this, erroMsg);
            return false;
        }
    }

    return true;
}

/**
 * 消息提示
 * @param {any} _this
 * @param {string} msg
 */
function showMsg(_this, msg) {
    // 参数2：0:正常；1失败
    var type = typeof (arguments[2]) != "undefined" && arguments[2] == 0 ? 0 : 1;
    // 参数3：延时(0:表示不会自动消息)
    var duration = typeof (arguments[3]) != "undefined" && arguments[3] == 0 ? 0 : 3000;
    if (type == 0) {
        _this.$notify({
            title: '成功',
            message: msg,
            offset: 100,
            type: 'success',
            duration: duration
        });
    } else {
        _this.$notify.error({
            title: '错误',
            offset: 100,
            message: msg,
            duration: duration
        });
    }
}

/**
 * 提示确认操作
 * @param {any} _this
 * @param {string} msg
 * @param {function} succfunc
 */
function showComfirm(_this, msg, succfunc) {
    _this.$confirm(msg, '危险', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).catch((val) => {
        //console.log("");
    }).then((val) => {
        if (val == "confirm") {
            succfunc();
        }
    });
}

export default {
    checkSave: checkSave,
    showMsg: showMsg,
    showComfirm: showComfirm,
}