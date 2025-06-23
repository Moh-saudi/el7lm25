# إصلاح مشكلة Content Security Policy للفيديوهات

## 🐛 المشكلة
```
Refused to load media from 'https://www.youtube.com/watch?v=H_u-kIzp4fU' because it violates the following Content Security Policy directive: "default-src 'self' 'unsafe-inline' 'unsafe-eval'". Note that 'media-src' was not explicitly set, so 'default-src' is used as a fallback.
```

## ✅ الحل المطبق

### 1. تحديث CSP Headers في `next.config.js`:

```javascript
// إضافة دعم لفيديوهات YouTube, Vimeo, Dailymotion
"media-src 'self' https: data: blob: https://www.youtube.com https://youtube.com https://*.googlevideo.com https://*.ytimg.com https://player.vimeo.com https://vimeo.com https://www.dailymotion.com",
"connect-src 'self' https: wss: ws: data: https://www.youtube.com https://youtube.com https://*.googlevideo.com https://player.vimeo.com https://vimeo.com https://www.dailymotion.com",
"frame-src 'self' https: https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://vimeo.com https://www.dailymotion.com",
"child-src 'self' https: https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://vimeo.com https://www.dailymotion.com"
```

### 2. تحسين ReactPlayer للفيديوهات:

```javascript
<ReactPlayer
  config={{
    youtube: {
      playerVars: {
        showinfo: 1,
        modestbranding: 1,
        rel: 0,
        fs: 1,
        playsinline: 1
      }
    }
  }}
/>
```

### 3. دعم منصات فيديو متعددة:

```javascript
function getVideoThumbnail(url: string) {
  // YouTube
  // Vimeo  
  // Dailymotion
}
```

## 🎯 النتيجة
- ✅ فيديوهات YouTube تعمل بشكل طبيعي
- ✅ دعم لمنصات فيديو متعددة
- ✅ لا مزيد من أخطاء CSP
- ✅ تحسين أداء تشغيل الفيديوهات

**حالة الإصلاح**: ✅ مكتمل 