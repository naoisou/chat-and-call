// 利用可否チェック
const checkIsWebPushSupported = async () => {
  // グローバル空間にNotificationがあればNotification APIに対応しているとみなす
  if (!('Notification' in window)) {
    return false;
  }
  // グローバル変数navigatorにserviceWorkerプロパティがあればサービスワーカーに対応しているとみなす
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  try {
    const sw = await navigator.serviceWorker.ready;
    // 利用可能になったサービスワーカーがpushManagerプロパティがあればPush APIに対応しているとみなす
    if (!('pushManager' in sw)) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 
 * @returns 
 */
const getVapidPublicKey = async ()=>{
  let res = await fetch('https://web-push-server.vercel.app/api/generateKeys').then(r=>r.json())
  if(res){
    return res.publicKey;
  }
}

const createSubscription = async (applicationServerKey) => {
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(async (registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch((err) => {
          console.log('ServiceWorker registration failed: ', err);
      });
  }
  return (await (await navigator.serviceWorker.ready).pushManager.subscribe({ userVisibleOnly: true, "applicationServerKey": applicationServerKey })).toJSON()
}

const sendPushMsg = (title)=>{
  fetch('https://web-push-server.vercel.app/api/send', {
    method: 'POST',
    body: JSON.stringify({ subscription, payload: { title } })
  })

}