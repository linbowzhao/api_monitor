let store = {
  // token作为key，用户数据作为value，保持用户数据
  TOEKN_STORE: {},
  // 用户名字作为key，token作为value，保证一个用户登陆
  USER_STORE: {},
  randomToken: function () {
    let len = 32;
    let token = '';
    while(token.length < len){
      token += Math.random().toString(36).substring(2)
    }
    return token.substring(0,32)
  },
  get(token) {
    let userInfo = this.TOEKN_STORE[token]
    if (userInfo && this.USER_STORE[userInfo.openId] === token) {
      return userInfo
    }else {
      return undefined
    }
  },
  set(userInfo) {
    let ONLY_KEY = this.USER_STORE[userInfo.openId]
    let token = this.randomToken()
    if(ONLY_KEY)this.destroy(ONLY_KEY)
    this.USER_STORE[userInfo.openId] = token
    this.TOEKN_STORE[token] = userInfo
    return token
  },
  destroy(token){
    delete this.TOEKN_STORE[token]
    return token
  }
}

module.exports = store
