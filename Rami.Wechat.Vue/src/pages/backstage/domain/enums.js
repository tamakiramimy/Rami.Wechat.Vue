/**
 * 枚举类
 */
export class Enum {
    /**
     * 添加枚举字段
     * field: 枚举字段
     * label: 界面显示
     * value: 枚举值
     */
    add(field, label, value) {
        this[field] = { label, value }
        return this
    }

    /**
     * 根据枚举value获取其label
     */
    getLabelByValue(value) {
        // 字段不存在返回‘’
        if (value === undefined || value === null) {
            return ''
        }
        for (let i in this) {
            let e = this[i]
            if (e && e.value === value) {
                return e.label
            }
        }

        return ''
    }
}

export default {
    // 公众号素材类型
    EnumPubMediaType: new Enum().add('image', '图片', 'image').add('voice', '音频', 'voice').add('video', '视频', 'video').add('thumb', '缩略图', 'thumb').add('news', '图文', 'news'),
    // 公众号素材可同步类型
    EnumPubSyncTypes: new Enum().add('image', '图片', 'image').add('voice', '音频', 'voice').add('video', '视频', 'video'),
    // 公众号菜单类型
    EnumPubMenuTypes: new Enum().add('view', "链接", 'view').add('click', "点击", 'click').add('miniprogram', "小程序", 'miniprogram'),
    // 公众号自动应答素材类型
    EnumApMsgType: new Enum().add('Text', '文本', 'Text').add('Image', '公众号图片', 'Image').add('Voice', '公众号录音', 'Voice').add('Video', '公众号视频', 'Video')
        .add('News', '公众号图文', 'News').add('BackNews', '后台图文', 'BackNews').add('RedBag', '公众号红包', 'RedBag')

}